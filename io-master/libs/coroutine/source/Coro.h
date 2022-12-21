#ifndef CORO_DEFINED
#define CORO_DEFINED 1

#if defined(__linux__)
#define HAS_UCONTEXT 1
#endif

#if defined(__EMSCRIPTEN__)
#define HAS_UCONTEXT 1
#endif

#if defined(__APPLE__) && defined(__i386__)
#define USE_UCONTEXT 1
#endif

#if defined(__FreeBSD__)
#define HAS_UCONTEXT 1
#endif

#if defined(__OpenBSD__)
#undef HAS_UCONTEXT
#undef USE_UCONTEXT
#undef USE_FIBERS
#endif

#if defined(__amd64__) && !defined(__x86_64__)
#define __x86_64__ 1
#endif

#include "Common.h"
//#include "PortableUContext.h"
#include "taskimpl.h"

#if defined(__SYMBIAN32__)
#define CORO_STACK_SIZE 8192
#define CORO_STACK_SIZE_MIN 1024
#else
//#define CORO_DEFAULT_STACK_SIZE     (65536/2)
//#define CORO_DEFAULT_STACK_SIZE  (65536*4)

// 128k needed on PPC due to parser
#define CORO_DEFAULT_STACK_SIZE (128 * 1024)
//#define CORO_DEFAULT_STACK_SIZE (256*1024)
#define CORO_STACK_SIZE_MIN 8192
#endif

#if defined(WIN32)
#if defined(BUILDING_CORO_DLL) || defined(BUILDING_IOVMALL_DLL)
#define CORO_API __declspec(dllexport)
#else
#define CORO_API __declspec(dllimport)
#endif

#else
#define CORO_API
#endif

#define CORO_IMPLEMENTATION "emscripten"


#ifdef __cplusplus
extern "C" {
#endif

typedef struct Coro Coro;

struct Coro {
    size_t requestedStackSize;
    size_t allocatedStackSize;
    void *stack;

#ifdef USE_VALGRIND
    unsigned int valgrindStackId;
#endif

#if defined(USE_FIBERS)
    void *fiber;
#elif defined(USE_UCONTEXT)
    ucontext_t env;
#elif defined(USE_SETJMP)
    jmp_buf env;
#endif

    unsigned char isMain;
};

CORO_API Coro *Coro_new(void);
CORO_API void Coro_free(Coro *self);

// stack

CORO_API void *Coro_stack(Coro *self);
CORO_API size_t Coro_stackSize(Coro *self);
CORO_API void Coro_setStackSize_(Coro *self, size_t sizeInBytes);
CORO_API size_t Coro_bytesLeftOnStack(Coro *self);
CORO_API int Coro_stackSpaceAlmostGone(Coro *self);

CORO_API void Coro_initializeMainCoro(Coro *self);

typedef void(CoroStartCallback)(void *);

CORO_API void Coro_startCoro_(Coro *self, Coro *other, void *context,
                              CoroStartCallback *callback);
CORO_API void Coro_switchTo_(Coro *self, Coro *next);
CORO_API void Coro_setup(Coro *self, void *arg); // private

#ifdef __cplusplus
}
#endif
#endif
