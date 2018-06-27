from __future__ import print_function

import time

def fib(n):
  if n < 2: return n
  return fib(n - 1) + fib(n - 2)

start = time.clock()

# fib(28)

print(fib(6))
print("elapsed: " + str(time.clock() - start))

