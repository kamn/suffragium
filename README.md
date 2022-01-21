# Suffragium

A Basic Vote Counting Library

Supports the following vote counting systems

* First Past The Post
* Sortition
* Bucklin
* Copeland

## Examples

See the test files

## Why and Direction
For the fun of it but there are some additional advantages over similar libraries like  

* Personal Development - As stupid as it is I wanted some project that would be fun, refine my professional skills, and a good example project.
* Typescript - Better to formally validate that the election and ballots are correct for the system that is being used.
* Functional Style

## Direction

* Implement All System On Wikipedia - See https://en.wikipedia.org/wiki/Comparison_of_electoral_systems
* Implement Weighted Versions - Most voting systems assume equal weight between ballots but unequal weight is interesting idea and is used in stock-holder votes.
* Extensible - Ability for the users to add new systems within the framework easily.
* Playground - Eventually I would like the project to be used to implement and test new systems and ideas.
* Property Testing - Voting systems have multiple properties(Majority, Condorcet, Cloneproof, Monotone, etc) and I think these can be tested through property based tests. Might not be useful if someone is looking for mathematical verification. 

## License
Copyright 2022 kamn

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Other Libraries
https://github.com/anarchodin/caritat
https://github.com/julien-boudry/Condorcet
