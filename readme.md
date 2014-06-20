Probability Trees:

An easier way to handle runtime changes to randomized logic.

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


This would be hundreds of lines of incomprehensible code if written procedurally with if's and else's.  (I built this after looking at a particularaly horrid 90 lines of that stuff before I stopped and realized there was a better way).  

Not only is this far more readable, it's not code - it's data.  It can be changed at runtime.  It's not static, and can be modified for special characteristics of players, like a quarterback who is especially agile.

elusiveQB = {
		sack: -4,
		qbScramble: 2,
		runningPass: 5,
		runningPass_ : {shortCompletion: 6, mediumCompletion: 6, incompletion: 1, intercepted: 1}
	};
    
The data structure is the powerful part.  The engine just recurses the probabilities until it finds a step with no left hand key, and then returns that step name.  The engine is only 80 lines of javascript - and uses underscore.  (It would be trivial to write a no-dependency version - I'm just using _.random, _.each, and _.keys).

Ultimately it's good to hook into an evaluation engine that knows what to do with the leaf values.  You can add as many intermediate steps as you want without having to make code changes to your evaluation engine.


API:

ProbabilityResolver.resolve(object)
- always returns a string of the 1st leaf key it finds.
- randomly by numeric weight picks a key from 'first'
- if that key is also a key of object, it'll do it again on that key.
- if that key isn't a top-level key, it just returns it.

Convert code like this:

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

To this:

var obj = {
    first: {a: 5, b: 5, c: 90},
    a: {b: 5, d: 5}
};
return new ProbabilityResolver().resolve(obj);


-------------------------

ProabilityResolver.modify(base, mod)
- recursively applies changes to the weights of keys in mod.
- to change a top level key, use the key's name with an '_' at the end.

var obj = {
    first: {a: 4, b: 5},
    a: {b:5, c: 5}},
    mod = { a: 4, a_: {c: 5}};
ProbabilityResolver.modify(obj, mod);

afterwards, obj will be:
    {first: {a: 8, b: 5},
    a: {c:5}}