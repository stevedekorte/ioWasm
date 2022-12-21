/*
 Credits

        Originally based on Edgar Toernig's Minimalistic cooperative
        multitasking http://www.goron.de/~froese/ reorg by Steve Dekorte and Chis
        Double Symbian and Cygwin support by Chis Double Linux/PCC, Linux/Opteron, Irix
        and FreeBSD/Alpha, ucontext support by Austin Kurahone FreeBSD/Intel support by
        Faried Nawaz Mingw support by Pit Capitain Visual C support by Daniel Vollmer
        Solaris support by Manpreet Singh
        Fibers support by Jonas Eschenburg
        Ucontext arg support by Olivier Ansaldi
        Ucontext x86-64 support by James Burgess and Jonathan Wright
        Russ Cox for the newer portable ucontext implementions.
        Mac OS X support by Jorge Acereda
        Guessed setjmp support (Android/Mac OS X/others?) by Jorge Acereda

 Notes

        This is the system dependent coro code.
        Setup a jmp_buf so when we longjmp, it will invoke 'func' using 'stack'.
        Important: 'func' must not return!

        Usually done by setting the program counter and stack pointer of a new,
        empty stack. If you're adding a new platform, look in the setjmp.h for PC and
        SP members of the stack structure

        If you don't see those members, Kentaro suggests writting a simple
        test app that calls setjmp and dumps out the contents of the jmp_buf.
        (The PC and SP should be in jmp_buf->__jmpbuf).

        Using something like GDB to be able to peek into register contents right
        before the setjmp occurs would be helpful also.
 */

#include "Base.h"
#include "Common.h"
#include "Coro.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stddef.h>
#include "taskimpl.h"
#include <assert.h>

#ifdef USE_VALGRIND
#include <valgrind/valgrind.h>
#define STACK_REGISTER(coro)                                                   \
    {                                                                          \
        Coro *c = (coro);                                                      \
        c->valgrindStackId = VALGRIND_STACK_REGISTER(                          \
            c->stack, (char *)c->stack + c->requestedStackSize);               \
    }

#define STACK_DEREGISTER(coro)                                                 \
    VALGRIND_STACK_DEREGISTER((coro)->valgrindStackId)
#else
#define STACK_REGISTER(coro)
#define STACK_DEREGISTER(coro)
#endif

typedef struct CallbackBlock {
    void *context;
    CoroStartCallback *func;
} CallbackBlock;

void *io_calloc16(size_t nelem, size_t elsize) {
    // emfiber API want 16 byte aligned memory
    // may not be needed for other allocs here
    
    size_t fullSize = elsize; //+ 16;
    void *m = (void *)memalign(16, fullSize); 
    memset(m, 0, fullSize);
    assert(m != NULL);
    return m;
}

Coro *Coro_new(void) {
    Coro *self = (Coro *)io_calloc(1, sizeof(Coro));
    self->requestedStackSize = CORO_DEFAULT_STACK_SIZE;
    self->allocatedStackSize = 0;
    self->emfiber = io_calloc16(1, sizeof(emscripten_fiber_t));
    self->stack = NULL;
    return self;
}

void Coro_allocStackIfNeeded(Coro *self) {
    if (self->stack && (self->requestedStackSize != self->allocatedStackSize)) {
        io_free(self->stack);
        self->stack = NULL;
        self->allocatedStackSize = 0;
    }

    if (!self->stack) {
        self->stack = (void *)io_calloc16(1, self->requestedStackSize + 16);
        self->allocatedStackSize = self->requestedStackSize;
        // printf("Coro_%p allocating stack size %i\n", (void *)self,
        // self->requestedStackSize);
        STACK_REGISTER(self);
    }
}

void Coro_free(Coro *self) {
    STACK_DEREGISTER(self);
    if (self->stack) {
        io_free(self->stack);
        io_free(self->asyncify_stack);
    }
    // printf("Coro_%p io_free\n", (void *)self);
    io_free(self);
}

// stack

void *Coro_stack(Coro *self) { 
    return self->stack; 
}

size_t Coro_stackSize(Coro *self) { 
    return self->requestedStackSize; 
}

void Coro_setStackSize_(Coro *self, size_t sizeInBytes) {
    self->requestedStackSize = sizeInBytes;
    // self->stack = (void *)io_realloc(self->stack, sizeInBytes);
    // printf("Coro_%p io_reallocating stack size %i\n", (void *)self,
    // sizeInBytes);
}

#if __GNUC__ >= 4
ptrdiff_t *Coro_CurrentStackPointer(void) __attribute__((noinline));
#endif

ptrdiff_t *Coro_CurrentStackPointer(void) {
    ptrdiff_t a;
    ptrdiff_t *b = &a; // to avoid compiler warning about unused variables
    // ptrdiff_t *c = a ^ (b ^ a); // to avoid
    return b;
}

size_t Coro_bytesLeftOnStack(Coro *self) {
    unsigned char dummy;
    ptrdiff_t p1 = (ptrdiff_t)(&dummy);
    ptrdiff_t p2 = (ptrdiff_t)Coro_CurrentStackPointer();
    int stackMovesUp = p2 > p1;
    ptrdiff_t start = ((ptrdiff_t)self->stack);
    ptrdiff_t end = start + self->requestedStackSize;

    if (stackMovesUp) {
        // like PPC
        return end - p1;
    } else {
        // like x86
        return p1 - start;
    }
}

int Coro_stackSpaceAlmostGone(Coro *self) {
    return Coro_bytesLeftOnStack(self) < CORO_STACK_SIZE_MIN;
}

void Coro_initializeMainCoro(Coro *self) {
    self->isMain = 1;

    emscripten_fiber_t *emfiber = self->emfiber;
    void *asyncify_stack = Coro_CurrentStackPointer();
    size_t asyncify_stack_size = 5*1024*1024; // default for emscripten?
    self->asyncify_stack = io_calloc16(1, asyncify_stack_size);
    self->allocatedStackSize = asyncify_stack_size;

    emscripten_fiber_init_from_current_context(emfiber, self->asyncify_stack, asyncify_stack_size);

    //printf("Coro setup main coro %p\n", (void *)self);
}

void Coro_startCoro_(Coro *self, Coro *other, void *context, CoroStartCallback *callback) {
    CallbackBlock sblock;
    CallbackBlock *block = &sblock;
    // CallbackBlock *block = malloc(sizeof(CallbackBlock)); // memory leak
    block->context = context;
    block->func = callback;

    Coro_setup(other, block);
    Coro_switchTo_(self, other);
}

void Coro_entryFunc(void *arg) {
    CallbackBlock *block = (CallbackBlock *)arg;
    (block->func)(block->context);
    printf("Scheduler error: returned from coro start function\n");
    exit(-1);
}

// --------------------------------------------------------------------

void Coro_UnsupportedPlatformError(void) {
    printf("Io Scheduler error: no Coro_setupJmpbuf entry for this platform\n.");
    exit(1);
}

void Coro_switchTo_(Coro *self, Coro *next) {
    assert(self != next);
    //printf("Coro_switchTo_(%p, %p)\n", (void *)self, (void *)next);
    emscripten_fiber_swap(self->emfiber, next->emfiber); 
    
    if (!self->isMain) {
        //emscripten_sleep(0); // needed? - see https://github.com/emscripten-core/emscripten/issues/13302
    }
}

// ---- setup ------------------------------------------

void Coro_setup(Coro *self, void *entry_func_arg) {
    // If this coro was recycled and already has a fiber, delete it.
    // Don't delete the main fiber. We don't want to commit suicide.

    assert(!self->isMain);
    //assert(!self->stack);
    Coro_allocStackIfNeeded(self);

    em_arg_callback_func entry_func = Coro_entryFunc;
    void *c_stack = self->stack;
    size_t c_stack_size = self->allocatedStackSize;
    self->asyncify_stack = io_calloc16(1, self->allocatedStackSize);
    size_t asyncify_stack_size = self->allocatedStackSize;

    //printf("Coro %p setup emscripten_fiber_init()...\n", (void *)self);

    emscripten_fiber_init(self->emfiber, 
        entry_func, 
        entry_func_arg, 
        c_stack, 
        c_stack_size, 
        self->asyncify_stack, 
        asyncify_stack_size);

    //printf("Coro setup new coro %p\n", (void *)self);
}
