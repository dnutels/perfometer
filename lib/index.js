'use strict';

const usage = require("pidusage");
const {jStat: stats} = require('jStat');

const B_IN_KB = 1024;

class Monitor {
    constructor(id) {
        this.id = id;
        this.cpu = [];
        this.memory = [];
    }

    start(interval = 100) {
        this.interval = setInterval(() => {
            process.nextTick(() => {
               usage.stat(this.id, (err, stat) => {
                   this.cpu.push(stat.cpu);
                   this.memory.push(stat.memory / B_IN_KB);
               });
            });
        }, interval);
    }

    stop() {
        usage.unmonitor(this.id);
        clearInterval(this.interval);
    }

    clear() {
        this.cpu = [];
        this.memory = [];
        this.id = null;
        clearInterval(this.interval);
        usage.unmonitor(this.id);
    }

    singleStat(name, ...args) {
        return {
            cpu: Math.round(stats[name](this.cpu, args) * 100) / 100,
            memory: Math.round(stats[name](this.memory, args) * 100) / 100,
        };
    }

    stats() {
        return {
            cpu: this.cpu,
            memory: this.memory,
            num: this.memory.length,
            min: this.singleStat('min'),
            max: this.singleStat('max'),
            mean: this.singleStat('mean'),
            median: this.singleStat('median'),
            sstdev: this.singleStat('stdev', true),
            '50%': this.singleStat('percentile', 0.5),
            '90%': this.singleStat('percentile', 0.90),
            '95%': this.singleStat('percentile', 0.95),
            '99%': this.singleStat('percentile', 0.99)
        }
    }
}

module.exports = Monitor;
