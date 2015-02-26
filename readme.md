# Probability Trees

This is a micro-library to provide an easier way to handle runtime changes to randomized logic for games of chance.

* Makes your probability tables data-driven rather than code-driven, so that you can change probabilities as you play-test without changing code.
* Makes your probability logic readable - so you can raipidly get a sense of the likely hood of an action.
* Allows for tremendous increase in richness with conditional probibilities that would be prohibitivly confusing with a if/else driven approach.
* Gets rid of pesky off by one errors in probability logic.

## Why

#### Declare your probability tables - don't code them.

	var obj = {
	    first: {a: 5, b: 5, c: 90},
	    a: {b: 5, d: 5}
	};
	return new ProbabilityResolver().resolve(obj);

* I can easily read this and tell it'll return 'c' 90% of the time, 'b' 7.5% of the time, and d 2.5% of the time.
* I can extend this object easily and add more conditional probabilities, so that c returns b or d 50% of the time, for instance.

Contrast that to long if / else chains.  It's not very readable and quickly gets out of hand with simple conditional probabilities.

#### Replaces code like this:

	var value = '';
	x = _.rand(0, 100);
	
	if( x < 5 ) {
	    value = 'a';
	} else if ( x < 10 ) {
	    return 'b';
	} else {
	    return 'c';
	}
	
	if( value ==== 'a' ) {
	    x = _.rand(0,10);
	    if(x<5) {
	        return 'b';
	    } else {
	        return 'd';
	    }
	}


## API

There are only two functions to learn!

### ProbabilityResolver.resolve(object)
* requires an object of the form { first: {key: number}}.
* always returns a string of the 1st leaf key it finds.
* randomly by numeric weight picks a key from 'first'
* if that key is also a key of object, it'll do it again on that key.
* if that key isn't a top-level key, it just returns it.

### ProabilityResolver.modify(base, mod)
* useful for having specific Actors change the rules in game without changing the underlying game engine for other Actors.
* produces a copy of your probability table with run-time changes to the probability table applied.
* recursively applies changes to the weights of keys in mod.
* to change a top level key, use the key's name with an '_' at the end.

Example:

	var obj = {
	    first: {a: 4, b: 5},
	    a: {b:5, c: 5}};
	var mod = { a: 4, a_: {c: 5}};
	ProbabilityResolver.modify(obj, mod);

Afterwards, obj will be:

	    {first: {a: 8, b: 5},
	    a: {c:5}}

#### Extended Example.

Here's an object modeling a play in (American) football.  On the left side are intermediate steps.  On the right side are outcomes from a given event.  Some of them are also intermediate steps, like 'the qb throws the ball', others are end states, such as 'incomplete pass', or 'touchdown'.

	return {
		first: {pass: 1, run: 1},
		pass: {shortPass: 1, longPass: 1},

		shortPass: {qbPressure: 4, qbScramble: 1, shortCompletion: 6, mediumCompletion: 2, longCompletion: 0, incompletion: 9, intercepted: 1},
		longPass: {qbPressure: 8, qbScramble: 2, shortCompletion: 2, mediumCompletion: 4, longCompletion: 8, incompletion: 16, intercepted: 2},
		badPass: {shortCompletion: 3, mediumCompletion: 2, longCompletion: 1, incompletion: 12, intercepted: 6},

		qbPressure: {sack: 8, qbScramble: 3, qbFumble: 3, badPass: 4, throwAway: 2},
		qbScramble: {sack: 3, shortGain: 4, mediumGain: 1, fumble: 1, runningPass: 7},
		runningPass: {shortCompletion: 4, mediumCompletion: 4, incompletion: 7, intercepted: 2},
		qbFumble: {bigLoss: 2, fumble: 2, defenseScore: 1},
		intercepted: {interception: 8, interceptionBigReturn: 3, fumble: 1, defenseScore: 1},
		throwAway: {intentionalGrounding: 1, incompletion: 10},

		shortCompletion: {shortGain: 10, mediumGain: 3, longGain: 1, fumble: 1, score: 1},
		mediumCompletion: {shortGain: 1, mediumGain: 10, longGain: 4, fumble: 1, score: 2},
		longCompletion: {shortGain: 0, mediumGain: 1, longGain: 10, fumble: 1, score: 5},

		run: {middleRun: 1, outsideRun: 1},

		middleRun: {shortLoss: 3, shortGain: 6, mediumGain: 2, longGain: 0, fumble: 1, score: 1},
		outsideRun: {shortLoss: 3, shortGain: 4, mediumGain: 3, longGain: 1, fumble: 1, score: 1},
		
		fumble: {shortLoss: 3, lostFumble: 3, shortGain: 1, defenseScore: 1}
	};

The real benefits here are that you can keep adding richness to the outcomes without writing code, so it's very declarative towards your domain.

Now - let's say you have a quarterback in your game who is really good at avoiding sacks - you can create an object and modify the table above for the qb like so:

	elusiveQB = {
		sack: -4,
		qbScramble: 2,
		runningPass: 5,
		runningPass_ : {shortCompletion: 6, mediumCompletion: 6, incompletion: 1, intercepted: 1}
	};
