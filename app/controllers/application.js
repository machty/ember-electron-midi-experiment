import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const midi = require('midi');
const output = new midi.output();
output.openVirtualPort('EmberMidi');

export default Ember.Controller.extend({
  speed: 180,

  makeNoise: task(function * () {
    while(true) {
      yield this.get('playNote').perform(40 + Math.random()*40);
    }
  }),

  glissandoUp: task(function * () {
    for(let i = 30; i < 100; ++i) {
      yield this.get('playNote').perform(i);
    }
  }),

  glissandoDown: task(function * () {
    for(let i = 100; i > 30; --i) {
      yield this.get('playNote').perform(i);
    }
  }),

  sinWave: task(function * () {
    let t = 0;
    while(true) {
      t += 0.3;
      yield this.get('playNote').perform(60 + Math.sin(t) * 30);
    }
  }),

  playMelody: task(function * () {
    for (let i of [20, 20, 18, 20, 0, 15, 0, 15, 20, 25, 24, 20]) {
      yield this.get('playNote').perform(i ? i + 60 : i);
    }
  }),

  playNote: task(function * (keyFloat, velocity = 127) {
    this.get('noteIndicator').perform();
    let key = Math.floor(keyFloat);
    let duration = this.get('speed');
    try {
      output.sendMessage([144, key, velocity]);
      yield timeout(duration);
    } finally {
      output.sendMessage([144, key, 0]);
    }
  }),

  noteIndicator: task(function * () {
    yield timeout(this.get('speed')/2);
  }).restartable(),
});

