var Pair = function(options) {
    var options = options || {};
    var x1, y1, u1, v1;
    var x2, y2, u2, v2;
    if (options.loading === true) {
        x1 = options.x1;
        x2 = options.x2;
        y1 = options.y1;
        y2 = options.y2;
        u1 = x1/2048 + 0.5;
        v1 = (-y1/1024) + 0.5;
        u2 = x2/2048 + 0.5;
        v2 = (-y2/1024) + 0.5;
    } else if (options.x1 !== undefined) {
        x1 = options.x1;
        y1 = options.y1;
        u1 = options.u1;
        v1 = options.v1;
        x2 = x1;
        y2 = y1;
        u2 = u1;
        v2 = v1;
    } else if (options.x2 !== undefined) {
        x2 = options.x2;
        y2 = options.y2;
        u2 = options.u2;
        v2 = options.v2;
        x1 = x2;
        y1 = y2;
        u1 = u2;
        v1 = v2;
    } else {
        return { valid: false };
    }
    var ret = {
        x1: x1, y1: y1,
        x2: x2, y2: y2,
        u1: u1, v1: v1,
        u2: u2, v2: v2,
        valid: true,
        isPair: true
    };
    return ret;
};

var TriMesh = function(n, radius, useVertexNormals) {
    var _this = this;
    this.n = n;
    this.radius = radius;
    this.group = new THREE.Group();
    this.useVertexNormals = useVertexNormals || false;

    this.index = function(i,j) {
        return parseInt(i*(i+1)/2+j);
    };
    this.bary = function(i,j) {
        var n = _this.n;
        return {
            x: (n-1-i)/(n-1),
            y: (i-j)/(n-1),
            z: j/(n-1)
        };
    };
    this.traverse = function(cb) {
        var n = _this.n;
        var cb = cb || function(){};
        for (var i = 0; i <= n-1; ++i) {
            for (var j = 0; j <= i; ++j) {
                cb(i,j);
            }
        }
    };
    this.a = new THREE.Vector3();
    this.b = new THREE.Vector3();
    this.c = new THREE.Vector3();
    this.uv1 = new THREE.Vector2();
    this.uv2 = new THREE.Vector2();
    this.uv3 = new THREE.Vector2();

    function lerpDirection(v1,v2,t) {
        var angle = v1.angleTo(v2);
        var axis = new THREE.Vector3().crossVectors(v1, v2).normalize();
        return v1.clone().applyAxisAngle(axis, angle*t).normalize();
    }

    this.position = function(i,j, useAxisAngle) {
        var v = new THREE.Vector3();
        if (useAxisAngle === true) {
            // use lerp
            var vl = lerpDirection(_this.a.clone().normalize(), _this.b.clone().normalize(), i/(_this.n-1));
            var vr = lerpDirection(_this.a.clone().normalize(), _this.c.clone().normalize(), i/(_this.n-1));
            return lerpDirection(vl, vr, j/i);
        } else {
            var b = _this.bary(i,j);
            v.x = b.x*_this.a.x + b.y*_this.b.x + b.z*_this.c.x;
            v.y = b.x*_this.a.y + b.y*_this.b.y + b.z*_this.c.y;
            v.z = b.x*_this.a.z + b.y*_this.b.z + b.z*_this.c.z;
            return v;
        }
    };
    this.uv = function(i,j) {
        var b = _this.bary(i,j);
        var v = new THREE.Vector2();
        v.x = b.x*_this.uv1.x + b.y*_this.uv2.x + b.z*_this.uv3.x;
        v.y = b.x*_this.uv1.y + b.y*_this.uv2.y + b.z*_this.uv3.y;
        return v;
    };
    this.update = function(a,b,c, useAxisAngle) {
        var n = _this.n;
        _this.a.copy(a.clone().normalize());
        _this.b.copy(b.clone().normalize());
        _this.c.copy(c.clone().normalize());
        if (_this.group.children.length > 0) {
            var mesh = _this.group.children[0];
            _this.traverse(function(i,j){
                var index = _this.index(i,j);
                mesh.geometry.vertices[index].copy(_this.position(i,j,useAxisAngle).setLength(_this.radius));
                if (_this.useVertexNormals) {
                    mesh.geometry.vertexNormals[index].copy(mesh.geometry.vertices[index].clone().negate().normalize());
                }
            });
            mesh.geometry.verticesNeedUpdate = true;
            if (_this.useVertexNormals) {
                mesh.geometry.normalsNeedUpdate = true;
            }
        }
    };
    this.init = function(a,b,c, uv1, uv2, uv3, material, n, radius, useAxisAngle) {
        _this.a.copy(a);
        _this.b.copy(b);
        _this.c.copy(c);
        _this.uv1.copy(uv1);
        _this.uv2.copy(uv2);
        _this.uv3.copy(uv3);
        _this.material = material;
        _this.n = n;
        _this.radius = radius;

        _this.group.children = [];
        var geometry = new THREE.Geometry();
        if (_this.useVertexNormals) {
            geometry.vertexNormals = [];
        }
        _this.traverse(function(i,j){
            var v = _this.position(i,j, useAxisAngle);
            geometry.vertices.push(v.setLength(_this.radius));
            if (_this.useVertexNormals) {
                geometry.vertexNormals.push(v.clone().negate().normalize());
            }
        });
        geometry.verticesNeedUpdate = true;
        if (_this.useVertexNormals) {
            geometry.normalsNeedUpdate = true;
        }
        geometry.faceVertexUvs[0] = [];
        for (var i = 1; i <= n-1; ++i) {
            for (var j = 0; j < i; ++j) {
                //             A(i-1,j)
                //
                //               /\
                //              /__\
                //
                //         B(i,j)   C(i,j+1)
                var ix = _this.index(i-1,j);
                var iy = _this.index(i,j);
                var iz = _this.index(i,j+1);
                geometry.faces.push( new THREE.Face3(ix,iy,iz) );
                geometry.faceVertexUvs[0].push([
                    _this.uv(i-1,j),
                    _this.uv(i,j),
                    _this.uv(i,j+1)
                ]);
            }
        }
        for (var i = 1; i <= n-2; ++i) {
            for (var j = 0; j < i; ++j) {
                //        B(i,j)   A(i,j+1)
                //              ____
                //              \  /
                //               \/
                //
                //           C(i+1,j+1)
                var ix = _this.index(i,j+1);
                var iy = _this.index(i,j);
                var iz = _this.index(i+1,j+1);
                geometry.faces.push( new THREE.Face3(ix,iy,iz) );
                geometry.faceVertexUvs[0].push([
                    _this.uv(i,j+1),
                    _this.uv(i,j),
                    _this.uv(i+1,j+1)
                ]);
            }
        }

        var mesh = new THREE.Mesh(geometry,material);
        _this.mesh = mesh;
        _this.group.add(mesh);
    };
};

var DualTriMesh = function(n, radius, useVertexNormals) {
    var _this = this;
    if (n === undefined) {
        _this.n = 5;
    } else {
        _this.n = n;
    }
    if (radius === undefined) {
        _this.radius = 500;
    } else {
        _this.radius = radius;
    }
    if (useVertexNormals === undefined) {
        _this.useVertexNormals = false;
    } else {
        _this.useVertexNormals = useVertexNormals;
    }
    this.group = new THREE.Group();
    this.group.dualTriMesh = _this;

    this.triMesh1 = new TriMesh(_this.n, _this.radius*1.0, _this.useVertexNormals);
    this.triMesh2 = new TriMesh(_this.n, _this.radius*1.2, _this.useVertexNormals);
    this.group.add(_this.triMesh1.group);
    this.group.add(_this.triMesh2.group);
    this.update = function(a,b,c,useAxisAngle) {
        _this.triMesh1.update(a,b,c,useAxisAngle);
        _this.triMesh2.update(a,b,c,useAxisAngle);
    };
    this.init = function(a,b,c, config1, config2, n, radius, useAxisAngle) {
        if (n !== undefined) { _this.n = n; }
        if (radius !== undefined) { _this.radius = radius; }
        _this.triMesh1.init(
            a, b, c,
            config1.uv1, config1.uv2, config1.uv3, config1.material,
            _this.n, _this.radius*1.0, useAxisAngle
        );
        _this.triMesh2.init(
            a, b, c,
            config2.uv1, config2.uv2, config2.uv3, config2.material,
            _this.n, _this.radius*1.2, useAxisAngle
        );
    };
};
