// rand class
// MTRand Sample
/*
console.log((new MTRand([0x123, 0x234, 0x345, 0x456])).randN(5));
console.log("1067595299  955945823  477289528 4107218783 4228976476");
*/
const MTRand = self.MTRand = class MTRand {
  constructor(seed){
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df;
    this.UPPER_MASK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;
    this.mt = new Array(this.N);
    this.mti = this.N + 1;
    if (seed !== undefined){
      if (typeof seed === 'number'){
        this.init(seed);
      }else{
        this.init_by_array(seed);
      }
    }
  }
  xor(a,b){
    return ((((a >>> 16) & 0x0000ffff) ^ ((b >>> 16) & 0x0000ffff)) << 16) + ((a & 0x0000ffff) ^ (b & 0x0000ffff)) >>> 0;
  }
  mul(a,b){
    if (a < b){
      const t = a;
      a = b;
      b = t;
    }
    return ((((a >>> 16) & 0x0000ffff) * b) << 16) + ((a & 0x0000ffff) * b) >>> 0;
  }
  init(seed){
    this.seed = seed;
    this.mt[0] = seed >>> 0; // this.mt[0] = seed & 0xffffffff;
    for (this.mti=1; this.mti<this.N; this.mti++) {
      this.mt[this.mti] = (this.mul(1812433253 , (this.xor(this.mt[this.mti-1] , (this.mt[this.mti-1] >>> 30)))) + this.mti);
      this.mt[this.mti] = this.mt[this.mti] >>> 0; //this.mt[this.mti] &= 0xffffffff;
    }
  }
  init_by_array(seeds){
    this.seed = seeds;
    let i, j, k;
    this.init(19650218);
    i=1; j=0;
    k = (this.N>seeds.length ? this.N : seeds.length);
    for (; k; k--) {
      this.mt[i] = (this.xor(this.mt[i] , (this.mul(this.xor(this.mt[i-1] , (this.mt[i-1] >>> 30)) , 1664525)))) + seeds[j] + j;
      this.mt[i] = this.mt[i] >>> 0; // this.mt[i] &= 0xffffffff;
      i++; j++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
      if (j>=seeds.length) j=0;
    }
    for (k=this.N-1; k; k--) {
      this.mt[i] = (this.xor(this.mt[i] , (this.mul(this.xor(this.mt[i-1] , (this.mt[i-1] >>> 30)) , 1566083941)))) - i;
      this.mt[i] = this.mt[i] >>> 0; // this.mt[i] &= 0xffffffff;
      i++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
    }
    this.mt[0] = 0x80000000;        
  }
  rand(){
    let y;
    const mag01 = [0x0, this.MATRIX_A];
    if (this.mti >= this.N) {
      let kk;
      if (this.mti == this.N+1) this.init(5489);
      for (kk=0;kk<this.N-this.M;kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.xor(this.xor(this.mt[kk+this.M] , (y >>> 1)) , mag01[y & 0x1]);
      }
      for (;kk<this.N-1;kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.xor(this.xor(this.mt[kk+(this.M-this.N)] , (y >>> 1)) , mag01[y & 0x1]);
      }
      y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
      this.mt[this.N-1] = this.xor(this.xor(this.mt[this.M-1] , (y >>> 1)) , mag01[y & 0x1]);
      this.mti = 0;
    }
    y = this.mt[this.mti++];
    y = this.xor(y,(y >>> 11));
    y = this.xor(y,(y << 7) & 0x9d2c5680);
    y = this.xor(y,(y << 15) & 0xefc60000);
    y = this.xor(y,(y >>> 18));
    return y >>> 0;
  }
  randN(count){
    const r = new Array(count);
    for(let i=0;i<count;i++){
      r[i] = this.rand();
    }
    console.log(this)
    return r;
  }
}
const rand_vals = self.rand_vals = function rand_vals(seed,count){
  if (count === undefined || count === null || count <= 0) count = 1;
  console.log(this)
  return (new MTRand(seed)).randN(count);
}
