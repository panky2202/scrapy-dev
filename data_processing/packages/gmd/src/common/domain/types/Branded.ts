/*
# Why do we use branded objects

# We want powerful domain driven data types

For example, we have a type
type MagicNumber = number

And a parse function
function parseMagicNumber(x: number): MagicNumber {
   if (x < 23 || x > 100) throw 'Is Not a magic number'
   return x as MagicNumber
}

If all the MagicNumbers in our program are created with this parse function, we can guarantee,
that all the values of MagicNumber are in [23, 100]
If we see one, eg:
function foo(x: MagicNumber) {...} - we do not need additionally check inside foo()
that MagicNumber is in a valid range, we already know it.

This allows us to pass specific assumptions about data around our program.
We can skip checking that MagicNumber is in the correct range in each function, that uses it.
The data type itself will guarantee, that the value is in the correct range.

You can make guarantees that Email is an email, and an Item has a non-negative price is USD.

Without such guarantees, you would need to validate your input in each function with your domain business logic.
But with such guarantees, you could parse data once at a border of your system, where IO happens, and use the data
without any fear of invalid input.

This is a very powerful technic, that drastically reduces boilerplate validations and improves code quality.

# How can we implement the domain driven types

In Typescript this is a valid construct:

type SomeDataType = {data: string}
type SomeOtherType = {data: string, other: number}
const x: SomeOtherType = {data: 'test', other: 42}
const y: SomeDataType = x

We could easily use 'SomeOtherType' instead of 'SomeDataType' - there is no error
However, we would like to forbid such cast:

const x: MagicNumber = 101

Here we broke the MagicNumber rule of [23, 100], but we got no error from the TypeScript compiler.

To overcome this issue, we would like to use 'nominal types',
and in TS nominal types are implemented with branded objects.

# Branded objects

If:

type MagicNumber = number & {__brand: 'MagicNumber'}

We can't simply do:
const x: MagicNumber = 101

We will get an error "bad cast, __brand is missing" - this is exactly what we want
And our parseMagicNumber() - is still valid, it uses 'as' cast that suppresses the __brand check.

Now we could be sure that all MagicNumbers are created with parseMagicNumber function.

*/

import {Primitive} from './Primitive'

export type BrandName = string

// We use a class to hide the __brand field from an end user with 'private'
class Brand<Name extends BrandName> {
  // @ts-ignore
  private readonly __branded__Construct_only_with_parsing__Check_readme_in_declaration: {
    [P in Name]: 'brand'
  }
}

export type Branded<T, Name extends BrandName> = T & Brand<Name>

type RemoveBrand_<T, Name extends BrandName> = T extends Brand<Name>
  ? Omit<
      T,
      '__branded__Construct_only_with_parsing__Check_readme_in_declaration'
    >
  : T

export type RemoveBrand<T, Name extends BrandName = any> = T extends Primitive
  ? RemoveBrand_<T, Name>
  : RemoveBrand_<{[K in keyof T]: RemoveBrand<T[K], Name>}, Name>
