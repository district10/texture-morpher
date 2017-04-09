# texture-morpher
a tool to make morphable texture

Inspiration:

-   [Face Morphing using OpenCV (C++ / Python) - YouTube](https://www.youtube.com/watch?v=pqpS6BN0_7k)
-   [Face Morph Using OpenCV — C++ / Python | Learn OpenCV](http://www.learnopencv.com/face-morph-using-opencv-cpp-python/)

Notes:

-   [three.js / examples](https://threejs.org/examples/?q=texture#webgl_raycast_texture)
-   [three.js/webgl_raycast_texture.html at master · mrdoob/three.js](https://github.com/mrdoob/three.js/blob/master/examples/webgl_raycast_texture.html)
-   [pnitsch/GSVPano.js: Google Street View Panorama Util](https://github.com/pnitsch/GSVPano.js)
-   [Canvas Voronoi - bl.ocks.org](https://bl.ocks.org/mbostock/6675193)
-   [CodeSeven/toastr: Simple javascript toast notifications](https://github.com/CodeSeven/toastr)
-   [d3/API.md at master · d3/d3](https://github.com/d3/d3/blob/master/API.md#voronoi-diagrams-d3-voronoi)

---

TODO:

似乎得改写 triangles 使得它输出 index，而不是坐标。

```javascript
triangles: function() {
    var triangles = [],
        edges = this.edges;

    this.cells.forEach(function(cell, i) {
      if (!(m = (halfedges = cell.halfedges).length)) return;
      var site = cell.site,
          halfedges,
          j = -1,
          m,
          s0,
          e1 = edges[halfedges[m - 1]],
          s1 = e1.left === site ? e1.right : e1.left;

      while (++j < m) {
        s0 = s1;
        e1 = edges[halfedges[j]];
        s1 = e1.left === site ? e1.right : e1.left;
        if (s0 && s1 && i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
          triangles.push([site.data, s0.data, s1.data]);
        }
      }
    });

    return triangles;
}
```

See [d3-voronoi/Diagram.js at master · d3/d3-voronoi](https://github.com/d3/d3-voronoi/blob/master/src/Diagram.js#L82).

---

[eligrey/FileSaver.js: An HTML5 saveAs() FileSaver implementation](https://github.com/eligrey/FileSaver.js)

        // li.pair:not(.active) { border: 1px solid lightgray; }
    var STORAGE_KEY = 'pairs';
    var pairStorage = {
        fetch: function () {
            var pairs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            pairs.forEach(function (pair, index) { pair.id = index; });
            pairStorage.uid = pairs.length;
            return pairs;
        },
        save: function (pairs) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs.filter(function(pair){
                return pair.valid;
            })));
        }
    };

    /*
    toastr.info('Are you the 6 fingered man?');
    toastr.warning('My name is Inigo Montoya. You killed my father, prepare to die!');
    toastr.success('Have fun storming the castle!', 'Miracle Max Says');
    toastr.error('I do not think that word means what you think it means.', 'Inconceivable!');
    toastr.clear(); // animate remove
    */

