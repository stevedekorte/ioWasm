// metadoc Stack copyright Steve Dekorte 2002
// metadoc Stack license BSD revised
/*metadoc Stack description
Notes: first element of items is always 0x0.
*/

#define STACK_C
#include "Stack.h"
#undef STACK_C
#if !defined(_MSC_VER)
#include <inttypes.h>
#endif

Stack *Stack_new(void) {
    // size is the number of pointers, including the starting NULL.
    int size = STACK_START_SIZE;
    Stack *self = (Stack *)io_calloc(1, sizeof(Stack));
    self->items = (void **)io_calloc(1, size * sizeof(void *));
    // memEnd points past the end of the items memory block.
    self->memEnd = self->items + size;
    self->top = self->items;
    // self->lastMark = self->items;
    return self;
}

void Stack_free(Stack *self) {
    io_free(self->items);
    io_free(self);
}

Stack *Stack_clone(const Stack *self) {
    Stack *s = (Stack *)cpalloc(self, sizeof(Stack));

    ptrdiff_t nItems = self->top - self->items;
    ptrdiff_t size = nItems + 1;

    s->items = (void **)cpalloc(self->items, size * sizeof(void *));
    s->memEnd = s->items + size;
    s->top = s->items + nItems;
    return s;
}

void Stack_copy_(Stack *self, const Stack *other) {
    ptrdiff_t nItems = self->top - self->items;
    ptrdiff_t size = nItems + 1;
    ptrdiff_t sizeInBytes = size * sizeof(void *);

    self->items = (void **)io_realloc(self->items, sizeInBytes);
    memcpy(self->items, other->items, sizeInBytes);
    self->memEnd = self->items + size;
    self->top = self->items + nItems;
}

// stack --------------------------------------------------

size_t Stack_memorySize(const Stack *self) {
    return sizeof(Stack) + (self->memEnd - self->items);
}

void Stack_compact(Stack *self) {
    size_t oldSize = (1 + self->top - self->items) * sizeof(void *);
    self->items = (void **)io_realloc(self->items, oldSize);
}

void Stack_resize(Stack *self) {
    size_t oldSize = (self->memEnd - self->items) * sizeof(void *);
    size_t newSize = oldSize * STACK_RESIZE_FACTOR;
    size_t i = self->top - self->items;
    self->items = (void **)io_realloc(self->items, newSize);
    self->top = self->items + i;
    self->memEnd = self->items + (newSize / sizeof(void *));
}

// sizing ------------------------------------------------

void Stack_do_on_(const Stack *self, StackDoOnCallback *callback,
                  void *target) {
    Stack *stack = Stack_newCopyWithNullMarks(self);
    int i;

    for (i = 0; i < Stack_count(stack) - 1; i++) {
        void *v = Stack_at_(stack, i);
        if (v)
            (*callback)(target, v);
    }

    Stack_free(stack);
}

void Stack_makeMarksNull(Stack *self) {
    ptrdiff_t mark = self->lastMark;

    while (mark) {
        ptrdiff_t nextMark = (ptrdiff_t)self->items[mark];
        self->items[mark] = NULL;
        mark = nextMark;
    }
}

Stack *Stack_newCopyWithNullMarks(const Stack *self) {
    Stack *newStack = Stack_clone(self);
    Stack_makeMarksNull(newStack);
    return newStack;
}

void Stack_popToMark_(Stack *self, intptr_t mark) {
    while (self->lastMark && self->lastMark != mark) {
        Stack_popMark(self);
    }

    if (self->lastMark == 0) {
        printf("Stack error: unable to find mark %p in %p\n", (void *)mark,
               (void *)self);
        exit(1);
    }

    Stack_popMark(self);
}

List *Stack_asList(const Stack *self) {
    // slow
    List *list = List_new();
    Stack_do_on_(self, (StackDoOnCallback *)List_append_, list);
    return list;
}

// previously inlined --------------------------


void Stack_do_(const Stack *self, StackDoCallback *callback) {
    void **itemP = self->top;
    intptr_t mark = self->lastMark;

    while (itemP > self->items) {
        if (itemP - self->items == mark) {
            mark = (intptr_t)(*itemP);
        } else {
            (*callback)(*itemP);
        }

        itemP--;
    }
}

void Stack_doUntilMark_(const Stack *self, StackDoCallback *callback) {
    void **itemP = self->top;
    intptr_t mark = self->lastMark;

    while (itemP > self->items) {
        if (itemP - self->items == mark) {
            return;
        } else {
            (*callback)(*itemP);
        }

        itemP--;
    }
}

void Stack_clear(Stack *self) {
    self->top = self->items;
    self->lastMark = 0;
}

size_t Stack_totalSize(const Stack *self) {
    return (self->top - self->items);
}

int Stack_count(const Stack *self) {
    return (int)(self->top - self->items);
}

void Stack_push_(Stack *self, void *item) {
    self->top++;

    if (self->top == self->memEnd) {
        Stack_resize(self);
    }

    *(self->top) = item;
}

void Stack_pushMark(Stack *self) {
    Stack_push_(self, (void *)self->lastMark);
    self->lastMark = self->top - self->items;
}

intptr_t Stack_pushMarkPoint(Stack *self) {
    Stack_push_(self, (void *)self->lastMark);
    self->lastMark = self->top - self->items;
    return self->lastMark;
}

void *Stack_pop(Stack *self) {
    void *top = *(self->top);

    if (self->items != self->top) {
#ifdef STACK_POP_CALLBACK
        if (self->popCallback)
            self->popCallback(*(self->top));
#endif
        self->top--;
    }

    return top;
}

void Stack_popMark(Stack *self) {
#ifdef STACK_POP_CALLBACK
    if (self->popCallback)
        Stack_doUntilMark_(self, self->popCallback);
#endif

    self->top = self->items + self->lastMark - 1;

    if (self->lastMark) {
        self->lastMark = (intptr_t)(self->items[self->lastMark]);
    }
}

int Stack_popMarkPoint_(Stack *self, intptr_t mark) {
    while (self->lastMark && self->lastMark != mark) {
        Stack_popMark(self);
    }

    if (self->lastMark != mark) {
        return 0;
    }

    Stack_popMark(self);
    return 1;
}

void Stack_clearTop(Stack *self) {
    Stack_popMark(self);
    Stack_pushMark(self);
    // self->top = self->items + self->lastMark;
}

void *Stack_top(const Stack *self) { return *(self->top); }

void *Stack_at_(const Stack *self, int i) {
    return self->items[i + 1];
}

