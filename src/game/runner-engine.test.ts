import test from "node:test";
import assert from "node:assert/strict";
import {advanceRun,createRun,hitRun,tapRun} from "./runner-engine.ts";

test("walk mode is slower and more forgiving than challenge mode",()=>{
 const easy=createRun("easy"),challenge=createRun("challenge");assert.ok(easy.speed<challenge.speed);assert.ok(easy.combat.armor>challenge.combat.armor);
});

test("two taps allow a child-friendly double jump",()=>{
 const run=createRun("easy");tapRun(run);tapRun(run);assert.equal(run.jumps,2);assert.ok(run.vy<0);
});

test("walk mode collision keeps the run alive",()=>{
 const run=createRun("easy");run.combat.armor=0;hitRun(run);assert.equal(run.phase,"running");assert.ok(run.combat.armor>=1);
});

test("runner can reach the 1000 point clear",()=>{
 const run=createRun("challenge");run.score=999.8;advanceRun(run,.1);assert.equal(run.phase,"clear");assert.equal(run.score,1000);
});
