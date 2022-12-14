// metadoc Stack copyright Steve Dekorte 2002
// metadoc Stack license BSD revised
/*metadoc Stack description
        Stack - array of void pointers
        supports setting marks - when a mark is popped,
        all stack items above it are popped as well

        Designed to optimize push, pushMark and popMark
        at the expense of pop (since pop requires a mark check)
*/

#ifndef STACK_DEFINED
#define STACK_DEFINED 1

#include "Common.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stddef.h>
#include "List.h"

#ifdef __cplusplus
extern "C" {
#endif

#ifdef LOW_MEMORY_SYSTEM
#define STACK_START_SIZE 512
#define STACK_RESIZE_FACTOR 2
#else
#define STACK_START_SIZE 512
#define STACK_RESIZE_FACTOR 2
#endif

typedef void(StackDoCallback)(void *);
typedef void(StackDoOnCallback)(void *, void *);

//#define STACK_POP_CALLBACK

#ifdef STACK_POP_CALLBACK
typedef void(StackPopCallback)(void *);
#endif

typedef struct {
    void **items;
    void **memEnd;
    void **top;
    intptr_t lastMark;

#ifdef STACK_POP_CALLBACK
    StackPopCallback *popCallback;
#endif
} Stack;

#define Stack_popCallback_(self, callback) self->popCallback = callback;

BASEKIT_API Stack *Stack_new(void);
BASEKIT_API void Stack_free(Stack *self);
BASEKIT_API Stack *Stack_clone(const Stack *self);
BASEKIT_API void Stack_copy_(Stack *self, const Stack *other);

BASEKIT_API size_t Stack_memorySize(const Stack *self);
BASEKIT_API void Stack_compact(Stack *self);

BASEKIT_API void Stack_resize(Stack *self);

BASEKIT_API void Stack_popToMark_(Stack *self, intptr_t mark);

// not high performance

BASEKIT_API void Stack_makeMarksNull(Stack *self);
BASEKIT_API Stack *Stack_newCopyWithNullMarks(const Stack *self);
BASEKIT_API void Stack_do_on_(const Stack *self, StackDoOnCallback *callback,
                              void *target);

BASEKIT_API List *Stack_asList(const Stack *self);

#include "Stack_inline.h"

// previously inlined ----------------

BASEKIT_API void Stack_do_(const Stack *self, StackDoCallback *callback);
BASEKIT_API void Stack_doUntilMark_(const Stack *self, StackDoCallback *callback);
BASEKIT_API void Stack_clear(Stack *self);
BASEKIT_API size_t Stack_totalSize(const Stack *self);
BASEKIT_API int Stack_count(const Stack *self);
BASEKIT_API void Stack_push_(Stack *self, void *item);
BASEKIT_API void Stack_pushMark(Stack *self);
BASEKIT_API intptr_t Stack_pushMarkPoint(Stack *self);
BASEKIT_API void *Stack_pop(Stack *self);
BASEKIT_API void Stack_popMark(Stack *self);
BASEKIT_API int Stack_popMarkPoint_(Stack *self, intptr_t mark);
BASEKIT_API void Stack_clearTop(Stack *self);
BASEKIT_API void *Stack_top(const Stack *self);
BASEKIT_API void *Stack_at_(const Stack *self, int i);

#ifdef __cplusplus
}
#endif
#endif
