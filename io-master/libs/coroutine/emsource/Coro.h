
#include <emscripten/emscripten.h>
#include <emscripten/fiber.h>

#ifdef __cplusplus
extern "C" {
#endif

#define CORO_IMPLEMENTATION "emscripten fiber"

#define CORO_DEFAULT_STACK_SIZE (128 * 1024)
#define CORO_STACK_SIZE_MIN 8192

#define CORO_API

typedef struct Coro Coro;

struct Coro {
    size_t requestedStackSize;
    size_t allocatedStackSize;
    void *stack;
    void *asyncify_stack;
    emscripten_fiber_t *emfiber;
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

