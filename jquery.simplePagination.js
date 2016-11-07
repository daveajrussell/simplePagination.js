/**
 * Slimmed down fork of the following library:
 *
 * simplePagination.js v1.6
 * A simple jQuery pagination plugin.
 * http://flaviusmatis.github.com/simplePagination.js/
 *
 * Copyright 2012, Flavius Matis
 * Released under the MIT license.
 * http://flaviusmatis.github.com/license.html
 *
 * By Dave Russell 2016
 */
(function($) {

    var methods = {
        init: function(options) {
            var o = $.extend({
                items: 1,
                itemsOnPage: 1,
                pages: 0,
                displayedPages: 5,
                edges: 2,
                currentPage: 0,
                prevText: '&lt;',
                nextText: '&gt;',
                ellipseText: '&hellip;',
                onPageClick: function(pageNumber, event) {
                    // Callback triggered when a page is clicked
                    // Page number is given as an optional parameter
                },
                onInit: function() {
                    // Callback triggered immediately after initialization
                }
            }, options || {});

            var self = this;

            o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;

            if (o.currentPage)
                o.currentPage = o.currentPage - 1;
            else
                o.currentPage = 0;

            o.halfDisplayed = o.displayedPages / 2;

            this.each(function() {
                self.data('pagination', o);
                methods._draw.call(self);
            });

            o.onInit();

            return this;
        },

        selectPage: function(page) {
            methods._selectPage.call(this, page - 1);
            return this;
        },

        prevPage: function() {
            var o = this.data('pagination');
            if (o.currentPage > 0) {
                methods._selectPage.call(this, o.currentPage - 1);
            }
            return this;
        },

        nextPage: function() {
            var o = this.data('pagination');
            if (o.currentPage < o.pages - 1) {
                methods._selectPage.call(this, o.currentPage + 1);
            }

            return this;
        },

        getPagesCount: function() {
            return this.data('pagination').pages;
        },

        setPagesCount: function(count) {
            this.data('pagination').pages = count;
        },

        getCurrentPage: function() {
            return this.data('pagination').currentPage + 1;
        },

        destroy: function() {
            this.empty();
            return this;
        },

        drawPage: function(page) {
            var o = this.data('pagination');
            o.currentPage = page - 1;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        redraw: function() {
            methods._draw.call(this);
            return this;
        },

        disable: function() {
            var o = this.data('pagination');
            o.disabled = true;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        enable: function() {
            var o = this.data('pagination');
            o.disabled = false;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        updateItems: function(newItems) {
            var o = this.data('pagination');
            o.items = newItems;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._draw.call(this);
        },

        updateItemsOnPage: function(itemsOnPage) {
            var o = this.data('pagination');
            o.itemsOnPage = itemsOnPage;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._selectPage.call(this, 0);
            return this;
        },

        getItemsOnPage: function() {
            return this.data('pagination').itemsOnPage;
        },

        _draw: function() {
            var o = this.data('pagination'),
                interval = methods._getInterval(o);

            methods.destroy.call(this);

            var $panel = this;

            // Generate Prev link
            if (o.prevText) {
                methods._appendItem.call(this, o.currentPage - 1, {
                    text: o.prevText,
                    classes: 'prev'
                });
            }

            if (interval.start > 0 && o.edges > 0) {

                var end = Math.min(o.edges, interval.start);
                for (i = 0; i < end; i++) {
                    methods._appendItem.call(this, i);
                }

                if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                    $panel.append('<a>' + o.ellipseText + '</a>');
                } else if (interval.start - o.edges == 1) {
                    methods._appendItem.call(this, o.edges);
                }
            }

            // Generate interval links (this is specific, find a way to make generic - keeps a consistent number of options on screen)
            if (interval.start === 1) {
                for (i = interval.start; i < interval.end + 1; i++) {
                    methods._appendItem.call(this, i);
                }
            } else if (interval.start == 14) {
                for (i = interval.start; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else if (interval.start == 15) {
                for (i = interval.start - 1; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else if (interval.start > 14) {
                for (i = interval.start - 2; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else if (interval.start > 1 && interval.start < 14) {
                for (i = interval.start; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else {
                for (i = interval.start; i < interval.end + 2; i++) {
                    methods._appendItem.call(this, i);
                }
            }

            // Generate end edges
            if (interval.end < o.pages && o.edges > 0) {
                if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                    $panel.append('<a>' + o.ellipseText + '</a>');
                } else if (o.pages - o.edges - interval.end == 1) {
                    methods._appendItem.call(this, interval.end);
                }

                var begin = Math.max(o.pages - o.edges, interval.end);
                for (i = begin; i < o.pages; i++) {
                    methods._appendItem.call(this, i);
                }
            }

            // Generate Next link (unless option is set for at front)
            if (o.nextText && !o.nextAtFront) {
                methods._appendItem.call(this, o.currentPage + 1, {
                    text: o.nextText,
                    classes: 'next'
                });
            }

        },

        _getPages: function(o) {
            var pages = Math.ceil(o.items / o.itemsOnPage);
            return pages || 1;
        },

        _getInterval: function(o) {
            return {
                start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
                end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
            };
        },

        _appendItem: function(pageIndex, opts) {
            var self = this,
                options, $link, o = self.data('pagination');

            pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);

            options = {
                text: pageIndex + 1,
                classes: ''
            };

            options = $.extend(options, opts || {});

            if (options.classes === "prev" || options.classes === "next") {
                $link = $('<a>' + (options.text) + '</a>');
                $link.click(function(event) {
                    return methods._selectPage.call(self, pageIndex, event);
                });
            } else if (pageIndex == o.currentPage) {
                $link = $('<a class="current">' + (options.text) + '</a>');
            } else {
                $link = $('<a data-index="' + (pageIndex + 1) + '">' + (options.text) + '</a>');
                $link.click(function(event) {
                    return methods._selectPage.call(self, pageIndex, event);
                });
            }

            if (options.classes) {
                $link.addClass(options.classes);
            }

            self.append($link);
        },

        _selectPage: function(pageIndex, event) {
            var o = this.data('pagination');
            o.currentPage = pageIndex;
            methods._draw.call(this);
            return o.onPageClick(pageIndex + 1, event);
        }

    };

    $.fn.pagination = function(method) {

        // Method calling logic
        if (methods[method] && method.charAt(0) != '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pagination');
        }

    };

})(jQuery);