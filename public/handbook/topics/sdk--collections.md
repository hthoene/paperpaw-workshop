```rust
pub struct paperpaw_sdk::collections::VecMap<K, V>
pub fn paperpaw_sdk::collections::VecMap<K, V>::clear(&mut self)
pub fn paperpaw_sdk::collections::VecMap<K, V>::contains_key<Q: core::cmp::Ord + ?core::marker::Sized>(&self, &Q) -> bool where K: core::borrow::Borrow<Q>
pub fn paperpaw_sdk::collections::VecMap<K, V>::get<Q: core::cmp::Ord + ?core::marker::Sized>(&self, &Q) -> core::option::Option<&V> where K: core::borrow::Borrow<Q>
pub fn paperpaw_sdk::collections::VecMap<K, V>::get_mut<Q: core::cmp::Ord + ?core::marker::Sized>(&mut self, &Q) -> core::option::Option<&mut V> where K: core::borrow::Borrow<Q>
pub fn paperpaw_sdk::collections::VecMap<K, V>::get_or_insert_with(&mut self, K, impl core::ops::function::FnOnce() -> V) -> &mut V
pub fn paperpaw_sdk::collections::VecMap<K, V>::insert(&mut self, K, V) -> core::option::Option<V>
pub fn paperpaw_sdk::collections::VecMap<K, V>::is_empty(&self) -> bool
pub fn paperpaw_sdk::collections::VecMap<K, V>::iter(&self) -> impl core::iter::traits::double_ended::DoubleEndedIterator<Item = (&K, &V)> + core::iter::traits::exact_size::ExactSizeIterator
pub fn paperpaw_sdk::collections::VecMap<K, V>::keys(&self) -> impl core::iter::traits::double_ended::DoubleEndedIterator<Item = &K> + core::iter::traits::exact_size::ExactSizeIterator
pub fn paperpaw_sdk::collections::VecMap<K, V>::len(&self) -> usize
pub const fn paperpaw_sdk::collections::VecMap<K, V>::new() -> Self
pub fn paperpaw_sdk::collections::VecMap<K, V>::remove<Q: core::cmp::Ord + ?core::marker::Sized>(&mut self, &Q) -> core::option::Option<V> where K: core::borrow::Borrow<Q>
pub fn paperpaw_sdk::collections::VecMap<K, V>::shrink_to_fit(&mut self)
pub fn paperpaw_sdk::collections::VecMap<K, V>::values(&self) -> impl core::iter::traits::double_ended::DoubleEndedIterator<Item = &V> + core::iter::traits::exact_size::ExactSizeIterator
pub fn paperpaw_sdk::collections::VecMap<K, V>::values_mut(&mut self) -> impl core::iter::traits::double_ended::DoubleEndedIterator<Item = &mut V> + core::iter::traits::exact_size::ExactSizeIterator
pub fn paperpaw_sdk::collections::VecMap<K, V>::default() -> Self
pub fn paperpaw_sdk::collections::VecMap<K, V>::from_iter<I: core::iter::traits::collect::IntoIterator<Item = (K, V)>>(I) -> Self
pub fn paperpaw_sdk::collections::VecMap<K, V>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
