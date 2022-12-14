/*
 *  PointerHash.h
 *  CuckooHashTable
 *
 *  Created by Steve Dekorte on 2009 04 28.
 *  Copyright 2009 __MyCompanyName__. All rights reserved.
 *
 */

#ifndef POINTERHASH_DEFINED
#define POINTERHASH_DEFINED 1

#include "Common.h"
#include <stddef.h>
#include "PortableStdint.h"

#ifdef __cplusplus
extern "C" {
#endif

#define POINTERHASH_MAXLOOP 10

#include "PointerHash_struct.h"

BASEKIT_API PointerHash *PointerHash_new(void);
BASEKIT_API void PointerHash_copy_(PointerHash *self, const PointerHash *other);
BASEKIT_API PointerHash *PointerHash_clone(PointerHash *self);
BASEKIT_API void PointerHash_free(PointerHash *self);

// BASEKIT_API void PointerHash_at_put_(PointerHash *self, void *k, void *v);
BASEKIT_API void PointerHash_removeKey_(PointerHash *self, void *k);
BASEKIT_API size_t PointerHash_size(PointerHash *self); // actually the keyCount

BASEKIT_API size_t PointerHash_memorySize(PointerHash *self);
BASEKIT_API void PointerHash_compact(PointerHash *self);

// --- private methods ----------------------------------------

BASEKIT_API void PointerHash_setSize_(PointerHash *self, size_t size);
BASEKIT_API void PointerHash_insert_(PointerHash *self, PointerHashRecord *x);
BASEKIT_API void PointerHash_grow(PointerHash *self);
// BASEKIT_API void PointerHash_shrinkIfNeeded(PointerHash *self);
BASEKIT_API void PointerHash_shrink(PointerHash *self);
BASEKIT_API void PointerHash_show(PointerHash *self);
BASEKIT_API void PointerHash_updateMask(PointerHash *self);

#include "PointerHash_inline.h"

#define PointerHash_cleanSlots(self)
#define PointerHash_hasDirtyKey_(self, k) 0

// previously inlined -------------------

PointerHashRecord *PointerHash_record1_(PointerHash *self, void *k);
PointerHashRecord *PointerHash_record2_(PointerHash *self, void *k);
void *PointerHash_at_(PointerHash *self, void *k);
size_t PointerHash_count(PointerHash *self);
int PointerHashKey_hasKey_(PointerHash *self, void *key);
void PointerHash_at_put_(PointerHash *self, void *k, void *v);
void PointerHash_shrinkIfNeeded(PointerHash *self);
void PointerHashRecord_swapWith_(PointerHashRecord *self, PointerHashRecord *other);
void PointerHash_clean(PointerHash *self);

#ifdef __cplusplus
}
#endif
#endif
