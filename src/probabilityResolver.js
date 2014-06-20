var _ = _ || {};


function ProbabilityResolver(){
}

ProbabilityResolver.prototype.resolve = function(object){
	var x = object.first,
		y,
		cnt = 0;
	y = this.resolveNode(x);

	while(object.hasOwnProperty(y)){
		y = this.resolveNode(object[y]);
		cnt = cnt + 1;
		if(cnt > 100) {
			return undefined;
		}
	}
	return y;
};

ProbabilityResolver.prototype.resolveNode = function(node) {
	var sum = 0,
		rnd,
		accumulator = 0,
		index = 0,
		resolvedKey;

	_.each(node, function(itm) { sum += itm});
	rnd = _.random(1, sum);

	_.each(node, function(itm) { 
		accumulator += itm;
		if(accumulator >= rnd) {
			index = index;
		} else {
			index += 1;
		}
	});

	resolvedKey = _.keys(node)[index];
	return resolvedKey;
};

ProbabilityResolver.prototype.modify = function(base, mod) {
	_.each(_.keys(mod), function(key) {
		var delta = mod[key],
			tmp;

		if(key[key.length-1] === "_") {
			tmp = key.slice(0, key.length -1);
			if (base.hasOwnProperty(tmp)) {
				base[tmp] = mod[key];
			}
		} else {
			_.each(_.keys(base), function(baseKey) {
				if(base[baseKey].hasOwnProperty(key)) {
					base[baseKey][key] += delta;

					if(base[baseKey][key] < 0) {
						base[baseKey][key] = 0;
					}
				}
			});
		}
	});

	return base;
};