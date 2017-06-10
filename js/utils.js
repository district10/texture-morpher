// 一些工具
var _Util = function() {
    var _this = this;

    this.range = function(start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }

        return range;
    };

    // 哈希函数
    // util.hashCode("string")
    this.hashCode = function(str) {
        var hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; ++i) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    // var geometry = util.create( THREE['SphereGeometry'], [ 100, 3, 3 ] );
    // 来自：https://github.com/mrdoob/three.js/blob/6c7f000734f8579da37fb39e5c2e9e5e2dfb14f8/examples/webgl_modifier_subdivision.html
    this.create = function( klass, args ) {
        var F = function( klass, args ) {
            return klass.apply( this, args );
        };
        F.prototype = klass.prototype;
        return new F( klass, args );
    };

    // 使用：var button = util.fileInputReadAsDatUrl(); button.click(function(url){...});
    this.fileInputReadAsDataUrl = function(callback) {
        var cb = callback || function(){};
        var $ele = $('<input type="file" />');
        $ele.on("change", function(e) {
            var f = e.target.files[0];
            if (f) {
                var r;
                (r = new FileReader()).onload = function (event) {
                    cb(event.target.result);
                };
                r.readAsDataURL(f);
            }
        });
        return function() {
            $ele.click();
        }
    };

    // 使用：var button = util.fileInputReadAsText(); button.click(function(text){...});
    this.fileInputReadAsText = function(callback) {
        var cb = callback || function(){};
        var $ele = $('<input type="file" />');
        $ele.on("change", function(e) {
            var f = e.target.files[0];
            if (f) {
                var r;
                (r = new FileReader()).onload = function (event) {
                    cb(event.target.result);
                };
                r.readAsText(f);
            }
        });
        return function(){
            $ele.click();
        };
    };

    this.toogleVisibility = function() {
        var toogle = function (obj, value) {
            if (obj !== undefined && typeof(obj.visible) === 'boolean') {
                obj.visible = value || !obj.visible;
            }
        }
        return function(obj, value) {
            if (obj === undefined) {
                return;
            } else if (Array.isArray(obj)) {
                obj.forEach(function(o){
                    toogle(o, value);
                });
            } else {
                toogle(obj, value);
            }
        }
    }();

    // 下面是一些坐标转化，uv 坐标是 u（s 轴）、v（t 轴） 两个轴，u 从左往右为 0~1，v 从下到上是 0~1；
    // lonlat 就经纬度，lon 是 0~360，lat 是 -90~90（南极到北极）
    this.uv2lonlat = function(u, v) {
        return {
            "lon": u*360,
            "lat": (v-0.5) * 180
        };
    };

    this.lonlat2uv = function(lon, lat) {
        return {
            "u": lon/360,
            "v": lat/180+0.5
        };
    };

    // 经纬坐标转化到三维 xyz
    this.lonlat2xyz = function(lon, lat, radius) {
        var phi = THREE.Math.degToRad(90 - lat);
        var theta = THREE.Math.degToRad(lon);
        return {
            "x": radius * Math.sin(phi) * Math.cos(theta),
            "y": radius * Math.cos(phi),
            "z": radius * Math.sin(phi) * Math.sin(theta)
        };
    };

    // rtp 是 rho，theta，phi，三个角度
    this.xyz2rtp = function(x, y, z) {
        var r = Math.sqrt( x*x + y*y + z*z );
        return {
            radius: r,
            theta: THREE.Math.radToDeg( Math.atan(z/x) ),
            phi: THREE.Math.radToDeg( Math.acos(y/r) )
        };
    };

    this.rtp2xyz = function(radius, theta, phi) {
        var theta = THREE.Math.degToRad(theta);
        var phi = THREE.Math.degToRad(phi);
        return {
            "x": radius * Math.sin( phi ) * Math.cos( theta ),
            "y": radius * Math.cos( phi ),
            "z": radius * Math.sin( phi ) * Math.sin( theta )
        };
    };

    this.xyz2lonlat = function(x, y, z) {
        var r = Math.sqrt( x*x + y*y + z*z );
        var theta = Math.atan( z / x );
        var phi = Math.acos( y / r );
        return {
            "lon": THREE.Math.radToDeg(theta),
            "lat": 90 - THREE.Math.radToDeg(phi)
        };
    };
    this.xyz2uv = function(x, y, z) {
        var r = Math.sqrt( x*x + y*y + z*z ),
            theta = Math.atan( z / x ),
            phi = Math.acos( y / r );
        var lon = THREE.Math.radToDeg(theta),
            lat = 90 - THREE.Math.radToDeg(phi);
        return new THREE.Vector2(
            lon/360-180,
            (lat+90)/180
        );
    };

    // 重心坐标转化到笛卡尔
    this.barycentric2cartesian = function(bc,r1,r2,r3) {
        var a1 = bc.x, a2 = bc.y, a3 = 1-a1-a2;
        return new THREE.Vector2(
            a1*r1.x + a2*r2.x + a3*r3.x,
            a1*r1.y + a2*r2.y + a3*r3.y
        );
    };

    // 笛卡尔到重心坐标，对应论文 p21 页的公式
    this.cartesian2barycentric = function(car,r1,r2,r3) {
        var x1 = r1.x, y1 = r1.y,
            x2 = r2.x, y2 = r2.y,
            x3 = r3.x, y3 = r3.y,
            x = car.x, y = car.y;
        var denom = (y2-y3)*(x1-x3)+(x3-x2)*(y1-y3);
        return new THREE.Vector2(
            ((y2-y3)*(x-x3)+(x3-x2)*(y-y3)) / denom,
            ((y3-y1)*(x-x3)+(x1-x3)*(y-y3)) / denom
        );
    };

    this.useIntrusiveUtils = function() {
        // new Number(23).toRad()
        Number.prototype.toRad = function() { return this * Math.PI / 180; };
        Number.prototype.toDeg = function() { return this * 180 / Math.PI; };
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    };

    // 两个坐标转化到字符串，方便 hash
    this.pos2name = function(x, y) {
        return x.toFixed(0)+"-"+y.toFixed(0);
    };
    this.pos2vec = function(x, y, r, w, h) {
        var w = w || 4096,
            h = h || 2048;
        var xyz = Util.lonlat2xyz(x/w*360-180,y/h*180, r);
        return new THREE.Vector3(xyz.x, xyz.y, xyz.z);
    };
    this.xy2uv = function (x,y, w, h) {
        var w = w || 4096,
            h = h || 2048;
        return new THREE.Vector2( (x/w)+0.5, (y/h)+0.5 );
    };

    this.lerp = function(a,b,t) {
        return (1-t)*a+t*b;
    };
    this.lerpDirection = function(v1,v2,t) {
        var angle = v1.angleTo(v2);
        var axis = new THREE.Vector3().crossVectors(v1, v2).normalize();
        return v1.clone().applyAxisAngle(axis, angle*t).normalize();
    };

    return _this;
};

var Util = new _Util();
