
// metadoc Tag copyright Steve Dekorte 2002
// metadoc Tag license BSD revised

#ifndef IOTAG_DEFINED
#define IOTAG_DEFINED 1

#include "Common.h"
//#include "Stack.h"
#include "BStream.h"

#include "IoVMApi.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef void *(IoTagCloneFunc)(void *);              // self
typedef void(IoTagFreeFunc)(void *);                 // self
typedef void(IoTagMarkFunc)(void *);                 // self
typedef void(IoTagNotificationFunc)(void *, void *); // self, notification
typedef void(IoTagCleanupFunc)(void *);              // self

/*
typedef struct
{
        IoTagCursorFirstFunc *nextFunc;
        IoTagCursorNextFunc *nextFunc;
        IoTagCursorPreviousFunc *nextFunc;
        IoTagCursorJumpFunc *nextFunc;
        IoTagCursorLastFunc *nextFunc;
}
*/

/*
typedef void * (IoTagGetFunc)(void *, void *); // self, symbol -> object or 0x0
typedef void   (IoTagSetFunc)(void *, void *, void *); // self, symbol, object
typedef void   (IoTagGetAfterFunc)(void *, void *); // self, symbol -> object or
0x0

typedef void * (IoTagGetMetaFunc)(void *, void *); // self, symbol -> object or
0x0 typedef void   (IoTagSetMetaFunc)(void *, void *, void *); // self, symbol,
object
*/

typedef void *(IoTagPerformFunc)(void *, void *, void *); // self, locals, message
typedef void *(IoTagActivateFunc)(void *, void *, void *, void *,void *); // self, target, locals, message, slotContext
typedef int(IoTagCompareFunc)(void *, void *); // self and another IoObject
typedef void(IoTagWriteToStreamFunc)(void *, BStream *); // self, store, stream
typedef void *(IoTagAllocFromStreamFunc)(void *, BStream *);      // self, store, stream
typedef void(IoTagReadFromStreamFunc)(void *, BStream *); // self, store, stream

typedef struct {
    void *state;
    char *name;

    // memory management

    IoTagCloneFunc *cloneFunc;
    IoTagFreeFunc *freeFunc;
    IoTagCleanupFunc *tagCleanupFunc;
    IoTagMarkFunc *markFunc;
    IoTagNotificationFunc *notificationFunc;

    // actions

    // IoTagTouchFunc *touchFunc; // if present, call before type check
    IoTagPerformFunc *performFunc; // lookup and activate, return result
    IoTagActivateFunc
        *activateFunc; // return the receiver or compute and return a value
    IoTagCompareFunc *compareFunc;

    /*
    IoTagSetFunc *setFunc
    IoTagGetFunc *getFunc
    IoTagCursorFunc *cursorFunc
    */

    // persistence

    IoTagWriteToStreamFunc *writeToStreamFunc;
    IoTagAllocFromStreamFunc *allocFromStreamFunc;
    IoTagReadFromStreamFunc *readFromStreamFunc;

    // Stack *recyclableInstances;
    // int maxRecyclableInstances;
    int referenceCount;
} IoTag;

IOVM_API IoTag *IoTag_new(void);
IOVM_API IoTag *IoTag_newWithName_(const char *name);
IOVM_API void IoTag_free(IoTag *self);
IOVM_API int IoTag_reference(IoTag *self);

IOVM_API void IoTag_name_(IoTag *self, const char *name);
IOVM_API const char *IoTag_name(IoTag *self);

IOVM_API void IoTag_mark(IoTag *self);

#include "IoTag_inline.h"

// previously inlined -----------------

void IoTag_state_(IoTag *self, void *state);
void *IoTag_state(IoTag *self);

// activate

void IoTag_activateFunc_(IoTag *self, IoTagActivateFunc *func);
IoTagActivateFunc *IoTag_activateFunc(IoTag *self);
// clone

void IoTag_cloneFunc_(IoTag *self, IoTagCloneFunc *func);
IoTagCloneFunc *IoTag_cloneFunc(IoTag *self);

// cleanup

void IoTag_cleanupFunc_(IoTag *self, IoTagFreeFunc *func);
IoTagCleanupFunc *IoTag_cleanupFunc(IoTag *self);

// io_free

void IoTag_freeFunc_(IoTag *self, IoTagFreeFunc *func);
IoTagFreeFunc *IoTag_freeFunc(IoTag *self);

// mark

void IoTag_markFunc_(IoTag *self, IoTagMarkFunc *func);
IoTagMarkFunc *IoTag_markFunc(IoTag *self);

// compare

void IoTag_compareFunc_(IoTag *self, IoTagCompareFunc *func);
IoTagCompareFunc *IoTag_compareFunc(IoTag *self);

// stream write

void IoTag_writeToStreamFunc_(IoTag *self, IoTagWriteToStreamFunc *func);
IoTagWriteToStreamFunc *IoTag_writeToStreamFunc(IoTag *self);
// stream alloc

void IoTag_allocFromStreamFunc_(IoTag *self, IoTagAllocFromStreamFunc *func);

IoTagAllocFromStreamFunc *IoTag_allocFromStreamFunc(IoTag *self);

// stream alloc

void IoTag_readFromStreamFunc_(IoTag *self, IoTagReadFromStreamFunc *func);
IoTagReadFromStreamFunc *IoTag_readFromStreamFunc(IoTag *self);

// notification

void IoTag_notificationFunc_(IoTag *self, IoTagNotificationFunc *func);
IoTagNotificationFunc *IoTag_notificationFunc(IoTag *self);

// perform

void IoTag_performFunc_(IoTag *self, IoTagPerformFunc *func);
IoTagPerformFunc *IoTag_performFunc(IoTag *self);

#ifdef __cplusplus
}
#endif
#endif
