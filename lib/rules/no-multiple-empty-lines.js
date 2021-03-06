/**
 * @fileoverview Disallows multiple blank lines.
 * implementation adapted from the no-trailing-spaces rule.
 * @author Greg Cochard
 * @copyright 2014 Greg Cochard. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    // Use options.max or 2 as default
    var numLines = 2;

    // store lines that appear empty but really aren't
    var notEmpty = [];

    if (context.options.length) {
        numLines = context.options[0].max;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "TemplateLiteral": function(node) {
            var start = node.loc.start.line;
            var end = node.loc.end.line;
            while (start <= end) {
                notEmpty.push(start);
                start++;
            }
        },

        "Program:exit": function checkBlankLines(node) {
            var lines = context.getSourceLines(),
                currentLocation = -1,
                lastLocation,
                blankCounter = 0,
                location,
                trimmedLines = lines.map(function(str) {
                    return str.trim();
                });

            // add the notEmpty lines in there with a placeholder
            notEmpty.forEach(function(x, i) {
                trimmedLines[i] = x;
            });

            // a single empty line at the end is a valid case regardless of the value of "max" option
            if (trimmedLines[trimmedLines.length - 2] !== "" &&
                trimmedLines[trimmedLines.length - 1] === "") {
                return;
            }

            // Aggregate and count blank lines
            lastLocation = currentLocation;
            currentLocation = trimmedLines.indexOf("", currentLocation + 1);
            while (currentLocation !== -1) {
                lastLocation = currentLocation;
                currentLocation = trimmedLines.indexOf("", currentLocation + 1);
                if (lastLocation === currentLocation - 1) {
                    blankCounter++;
                } else {
                    if (blankCounter >= numLines) {
                        location = {
                            line: lastLocation + 1,
                            column: lines[lastLocation].length
                        };
                        context.report(node, location, "Multiple blank lines not allowed.");
                    }

                    // Finally, reset the blank counter
                    blankCounter = 0;
                }
            }
        }
    };

};

module.exports.schema = [
    {
        "type": "object",
        "properties": {
            "max": {
                "type": "integer"
            }
        },
        "required": ["max"],
        "additionalProperties": false
    }
];
