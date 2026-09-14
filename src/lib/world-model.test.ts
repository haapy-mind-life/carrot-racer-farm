import test from "node:test";
import assert from "node:assert/strict";
import {CROPS,migrateSave,reduceWorld} from "./world-model.ts";

test("v1 save migrates into six safe v2 plots",()=>{
 const state=migrateSave({money:321,bestRun:44,plots:[{crop:"carrot",water:2,gold:true}]});
 assert.equal(state.version,2);assert.equal(state.money,321);assert.equal(state.bestRun,44);assert.equal(state.plots.length,6);assert.equal(state.plots[0].crop,"carrot");
});

test("invalid numeric save values cannot create negative or infinite money",()=>{
 assert.equal(migrateSave({money:-99}).money,0);assert.equal(migrateSave({money:Number.POSITIVE_INFINITY}).money,50);
});

test("starter radish is free and can always start an empty farm",()=>{
 const state=migrateSave({money:0});const radish=CROPS.find(c=>c.id==="radish")!;assert.equal(radish.seedCost,0);
 const planted=reduceWorld(state,{type:"plant",index:0,crop:"radish"});assert.equal(planted.money,0);assert.equal(planted.plots[0].crop,"radish");
});

test("run settlement is idempotent and clear bonus is paid once",()=>{
 const start=migrateSave({money:0});const once=reduceWorld(start,{type:"settle-run",id:"run-1",score:1000,coins:10,clear:true});
 const twice=reduceWorld(once,{type:"settle-run",id:"run-1",score:1000,coins:10,clear:true});
 assert.equal(once.money,35);assert.equal(once.runs,1);assert.deepEqual(twice,once);
});
