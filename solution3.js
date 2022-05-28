{
    init: function(elevators, floors) {
        var top = floors.length - 1;
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

        // elevator
        for (i=0;i< elevators.length; i++) {
            let j =i;
            // Whenever the elevators[j] is idle (has no more queued destinations) ...
            elevators[j].on("idle", function() {
                // let's go to all the floors (or did we forget one?)

                if (elevators[j].currentFloor() == 0)
                    elevators[j].goToFloor(top);
                else if (elevators[j].currentFloor() == top)
                    elevators[j].goToFloor(0);
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
                    if (elevators[j].destinationQueue[1] > floorNum) {
                        elevators[j].goingUpIndicator(true);
                        elevators[j].goingDownIndicator(false);
                    } else {
                        elevators[j].goingUpIndicator(false);
                        elevators[j].goingDownIndicator(true);
                    }
                    if(direction=="up") {
                        floor_pushup_list.remove(floorNum);
                    }
                    if(direction=="down") {
                        floor_pushdown_list.remove(floorNum);
                    }
                }
            });
            elevators[j].on("stopped_at_floor", function(floorNum) {
                if (floorNum == 0) {
                    elevators[j].goingUpIndicator(true);
                    elevators[j].goingDownIndicator(false);  
                } else if (floorNum == top) {
                    elevators[j].goingUpIndicator(false);
                    elevators[j].goingDownIndicator(true);  
                }
            })

            elevators[j].on("floor_button_pressed", function(floorNum) {
                // Maybe tell the elevators[j] to go to that floor?
            });
        }

        // floor
        for (i=0;i< floors.length; i++) {
            let j = i;
            floors[j].on("up_button_pressed", function (){
                // Maybe tell an elevators[j] to go to this floor?
                //wmyalert(j+"th floor push up");
                if (!floor_pushup_list.includes(j))
                    floor_pushup_list.push(j);

            });
            floors[j].on("down_button_pressed ", function() {
                // Maybe tell an elevators[j] to go to this floor?
                //myalert(j+"th floor push down");
                if (!floor_pushdown_list.includes(j))
                    floor_pushdown_list.push(j);
            });
        }

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
