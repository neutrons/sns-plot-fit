import * as d3 from 'd3';
import $ from 'jquery';

export const setResponsive = {
    methods: {
        setResponsive() {
            let vm = this;

             // Add responsive elements
            // Essentially when the plot-1D gets resized it will look to the
            // width and scale the plot according to newly updated width.
            // The css file has min- and max-width's incase the resizing gets too small,
            // the plot will not scale below these dimensions.
            // Solution courtesy of: https://stackoverflow.com/a/26077110
            $.event.special.widthChanged = {
                remove: function() {
                    $(this).children('iframe.width-changed-' + vm.ID).remove();
                },
                add: function () {
                    var elm = $(this);
                    var iframe = elm.children('iframe.width-changed-' + vm.ID);
                    if (!iframe.length) {
                        iframe = $('<iframe/>').addClass('width-changed-' + vm.ID).prependTo(this);
                    }
                    var oldWidth = elm.width();
                    function elmResized() {
                        var width = elm.width();
                        if (oldWidth != width) {
                            elm.trigger('widthChanged', [width, oldWidth]);
                            oldWidth = width;
                        }
                    }

                    var timer = 0;
                    var ielm = iframe[0];
                    (ielm.contentWindow || ielm).onresize = function() {
                        clearTimeout(timer);
                        timer = setTimeout(elmResized, 20);
                    };
                }
            }

            let chart = $(".chart-" + vm.ID);
            let aspectRatio = chart.width() / chart.height()
            let container = chart.parent();

            $("#chart-" + vm.ID).on("widthChanged", function() {
                
                let targetWidth = container.width();
                chart.attr("width", targetWidth);
                chart.attr("height", Math.round(targetWidth / aspectRatio));
            });
        }
    }
}