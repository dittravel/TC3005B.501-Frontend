/**
 Optimization wrapper file
 */

import React from 'react';

export function withMemo<T>(Component: React.ComponentType<T>) {
  return React.memo(Component);
}