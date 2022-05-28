{
    init: function(elevators, floors) {
        var top = floors.length - 1;
        var halftop = top / 2;
        var floor_pushup_list = [];
        var floor_pushdown_list = [];
        // tool
        Array.prototype.remove = function(val) { 
            var index = this.indexOf(val); 
            if (index > -1) { 
                this.splice(index, 1); 
            } 
        };
        // log
        var mode = "0";
        function myalert(msg) {
            if (mode == "1") {
                window.alert(msg);
            }
        };

        function getmax(list) {
            if (list.length == 0)
                return 0;
            return list[list.length-1];
        }
        function getmin(list) {
            if (list.length == 0)
                return top;
            return list[0];
        }

        function nextstep(j) {
                floorNum = elevators[j].currentFloor();
                // 下一步
                // 还有目的地
                if (elevators[j].destinationQueue.length != 0) {
                    return;
                }
                if(floor_pushup_list.length==0 && floor_pushdown_list.length==0  && elevators[j].getPressedFloors().length==0) {
                    elevators[j].goingUpIndicator(true); elevators[j].goingDownIndicator(true);
                } else {
                    var maximum = Math.max(getmax(floor_pushup_list), getmax(floor_pushdown_list), getmax(elevators[j].getPressedFloors()));
                    var minimum = Math.min(getmin(floor_pushup_list), getmin(floor_pushdown_list), getmin(elevators[j].getPressedFloors()));
                    // 同向目的地更新
                    if (elevators[j].goingUpIndicator()) {
                        if (floor_pushup_list.includes(floorNum)) {
                            floor_pushup_list.remove(floorNum);
                            return;
                        }
                        myalert("switch1");
                        elevators[j].goingUpIndicator(false); elevators[j].goingDownIndicator(true);
                        if (floor_pushdown_list.includes(floorNum)) {
                            floor_pushdown_list.remove(floorNum);
                            return;
                        }
                        elevators[j].goToFloor(minimum);
                    } else {
                        if (floor_pushdown_list.includes(floorNum)) {
                            floor_pushdown_list.remove(floorNum);
                            return;
                        }
                        myalert("switch2");
                        elevators[j].goingUpIndicator(true); elevators[j].goingDownIndicator(false);
                        if (floor_pushup_list.includes(floorNum)) {
                            floor_pushup_list.remove(floorNum);
                            return;
                        }
                        elevators[j].goToFloor(maximum);
                    }
                }
        }

        function updateDst(j, floorNum) {
            //myalert("elevators["+j+"] trigger floor:"+floorNum);
            if(floor_pushup_list.length==0 && floor_pushdown_list.length==0  && elevators[j].getPressedFloors().length==0) {
                return;
            }
            // 如果没有目的地（初始，到达顶点或底点）
            if (elevators[j].destinationQueue.length == 0) {
                if (floorNum >  elevators[j].currentFloor() && elevators[j].goingUpIndicator()) {
                    elevators[j].goToFloor(floorNum);
                    elevators[j].goingDownIndicator(false);
                } 
                if (floorNum < elevators[j].currentFloor() && elevators[j].goingDownIndicator()) {
                    elevators[j].goToFloor(floorNum);
                    elevators[j].goingUpIndicator(false);
                }
                return
            }

            var maximum = Math.max(getmax(floor_pushup_list), getmax(floor_pushdown_list), getmax(elevators[j].getPressedFloors()));
            var minimum = Math.min(getmin(floor_pushup_list), getmin(floor_pushdown_list), getmin(elevators[j].getPressedFloors()));
            if (elevators[j].goingUpIndicator()) {
                if (maximum > elevators[j].destinationQueue[elevators[j].destinationQueue.length-1]) {
                    elevators[j].destinationQueue[elevators[j].destinationQueue.length-1] = maximum;
                    elevators[j].checkDestinationQueue();
                    return;
                }
            } else {
                if (minimum < elevators[j].destinationQueue[elevators[j].destinationQueue.length-1]) {
                    elevators[j].destinationQueue[elevators[j].destinationQueue.length-1] = minimum;
                    elevators[j].checkDestinationQueue();
                    return;
                }
            }
        }

        // elevator
        for (i=0;i< elevators.length; i++) {
            let j =i;
            // Whenever the elevators[j] is idle (has no more queued destinations) ...
            elevators[j].on("idle", function() {
                myalert("elevators["+j+"]nothing to do,dst:"+elevators[j].destinationQueue.length);
                if (j%2 == 0) {
                    //elevators[j].goToFloor(top,true);
                }
            });        
            elevators[j].on("passing_floor", function(floorNum, direction) {
                var stop=false;
                if (elevators[j].loadFactor() < 0.7 &&
                    ((direction=="up" && floor_pushup_list.includes(floorNum)) ||
                    (direction=="down" && floor_pushdown_list.includes(floorNum)))) {
                    stop = true;
                }
                if(stop || elevators[j].getPressedFloors().includes(floorNum)) {
                    elevators[j].goToFloor(floorNum,true);
                    //window.alert(direction + " stop for" + floorNum + " now: "+ elevators[j].destinationQueue);
                    if(direction=="up") {
                        floor_pushup_list.remove(floorNum);
                    }
                    if(direction=="down") {
                        floor_pushdown_list.remove(floorNum);
                    }
                }
            });
            elevators[j].on("stopped_at_floor", function(floorNum) {
                //myalert("end stop at "+floorNum+"\nuplist: "+floor_pushup_list+"\ndownlist: "+floor_pushdown_list);
                if(floorNum==0) {
                    //向上
                    //elevators[j].goingUpIndicator(true); elevators[j].goingDownIndicator(false);
                } else if (floorNum==top) {
                    // 向下
                    //elevators[j].goingUpIndicator(false); elevators[j].goingDownIndicator(true);
                }

                nextstep(j);

            })

            elevators[j].on("floor_button_pressed", function(floorNum) {
                // Maybe tell the elevators[j] to go to that floor?
                updateDst(j, floorNum)
            });
        }

        // floor
        for (i=0;i< floors.length; i++) {
            let floorNum = i;
            floors[floorNum].on("up_button_pressed", function (){
                
                // Maybe tell an elevators[j] to go to this floor?
                if (!floor_pushup_list.includes(floorNum)) {
                    floor_pushup_list.push(floorNum);
                    floor_pushup_list.sort();
                }
                for (j=0;j<elevators.length;j++) {
                    updateDst(j,floorNum);
                }
                    
            });
            floors[floorNum].on("down_button_pressed ", function() {
                
                // Maybe tell an elevators[j] to go to this floor?
                if (!floor_pushdown_list.includes(floorNum)) {
                    floor_pushdown_list.push(floorNum);
                    floor_pushdown_list.sort();
                }
                
                for (j=0;j<elevators.length;j++) {
                    updateDst(j,floorNum);
                }
                    
            });
        }

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
