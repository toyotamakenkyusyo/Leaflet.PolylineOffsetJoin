{
	const factory = function (a_L) {
		"use strict";
		const c_PolylineOffsetJoin = {};
		
		c_PolylineOffsetJoin.offsetPoints = function (a_points, a_options) {
			if (a_options.offset === undefined) {
				return a_points;
			}
			const c_offset_points = this.offsetPointsAlone(a_points, a_options.offset);
			if (a_options.start_angle === undefined || a_options.end_angle === undefined || a_options.pre_end_angle === undefined || a_options.post_start_angle === undefined || a_options.pre_offset === undefined || a_options.post_offset === undefined || a_options.offset === undefined) {
				return c_offset_points;
			}
			const c_joined_offset_points = this.joinOffsetPoints(c_offset_points, a_options);
			return c_joined_offset_points;
		};
		
		c_PolylineOffsetJoin.offsetPointsAlone = function (a_points, a_offset) {
			const c_offset_lines = [];
			for (let i1 = 1; i1 < a_points.length; i1++) {
				c_offset_lines.push({
					"start_x": a_points[i1 - 1]["x"],
					"start_y": a_points[i1 - 1]["y"],
					"start_x_2": null,
					"start_y_2": null,
					"start_m": null,
					"end_x": a_points[i1]["x"],
					"end_y": a_points[i1]["y"],
					"end_x_2": null,
					"end_y_2": null,
					"end_m": null,
					"valid": null,
					"angle": Math.atan2(a_points[i1]["y"] - a_points[i1 - 1]["y"], a_points[i1]["x"] - a_points[i1 - 1]["x"]),
					"length": ((a_points[i1]["x"] - a_points[i1 - 1]["x"]) ** 2 + (a_points[i1]["y"] - a_points[i1 - 1]["y"]) ** 2) ** 0.5
				});
			}
			// 初回のオフセット計算
			c_offset_lines[0]["start_x_2"] = c_offset_lines[0]["start_x"] - a_offset * Math.sin(c_offset_lines[0]["angle"]);
			c_offset_lines[0]["start_y_2"] = c_offset_lines[0]["start_y"] + a_offset * Math.cos(c_offset_lines[0]["angle"]);
			c_offset_lines[0]["start_m"] = 0;
			for (let i1 = 1; i1 < c_offset_lines.length; i1++) {
				f_offset_point(c_offset_lines[i1 - 1], c_offset_lines[i1], a_offset);
			}
			c_offset_lines[c_offset_lines.length - 1]["end_x_2"] = c_offset_lines[c_offset_lines.length - 1]["end_x"] - a_offset * Math.sin(c_offset_lines[c_offset_lines.length - 1]["angle"]);
			c_offset_lines[c_offset_lines.length - 1]["end_y_2"] = c_offset_lines[c_offset_lines.length - 1]["end_y"] + a_offset * Math.cos(c_offset_lines[c_offset_lines.length - 1]["angle"]);
			c_offset_lines[c_offset_lines.length - 1]["end_m"] = 0;
			// valid判定
			for (let i1 = 0; i1 < c_offset_lines.length; i1++) {
				if (c_offset_lines[i1]["start_m"] < c_offset_lines[i1]["length"] + c_offset_lines[i1]["end_m"]) {
					c_offset_lines[i1]["valid"] = true;
				} else {
					c_offset_lines[i1]["valid"] = false;
				}
			}
			
			// 逆転の除去
			// 「A new offset algorithm for closed 2D lines with Islands」の方法
			for (let i1 = 0; i1 < c_offset_lines.length - 1; i1++) {
				if (c_offset_lines[i1]["valid"] === false) {
					continue;
				}
				let l_last = null;
				for (let i2 = i1 + 1; i2 < c_offset_lines.length; i2++) {
					if (c_offset_lines[i2]["valid"] === true) {
						l_last = i2;
						break;
					}
				}
				if (l_last === null) { // 以降にvalidがない場合
					break;
				}
				// 除外する線分を特定
				const c_delete_index = [];
				if (i1 + 2 === l_last) { // 1個だけ逆転
					c_delete_index.push(i1 + 1);
				} else if (i1 + 2 < l_last) { // 複数個逆転
					for (let i2 = l_last - 1; i2 > i1; i2--) { // 除外する都合で逆順
						if (f_check_intersection(c_offset_lines[i1]["start_x_2"], c_offset_lines[i1]["start_y_2"], c_offset_lines[i1]["end_x_2"], c_offset_lines[i1]["end_y_2"], c_offset_lines[i2]["start_x"], c_offset_lines[i2]["start_y"], c_offset_lines[i2]["end_x"], c_offset_lines[i2]["end_y"]) === true) {
							continue;
						}
						if (f_check_intersection(c_offset_lines[l_last]["start_x_2"], c_offset_lines[l_last]["start_y_2"], c_offset_lines[l_last]["end_x_2"], c_offset_lines[l_last]["end_y_2"], c_offset_lines[i2]["start_x"], c_offset_lines[i2]["start_y"], c_offset_lines[i2]["end_x"], c_offset_lines[i2]["end_y"]) === true) {
							continue;
						}
						// validな前後のオフセット後の線分と交差しない
						c_delete_index.push(i2);
					}
				}
				if (c_delete_index.length === 0) { // 逆転がない場合、除外する線がない場合、次に進める
					continue;
				}
				// 線分を除去
				for (let i2 = 0; i2 < c_delete_index.length; i2++) {
					c_offset_lines.splice(c_delete_index[i2], 1);
					l_last -= 1;
				}
				// 再度オフセット
				for (let i2 = i1; i2 < l_last; i2++) {
					f_offset_point(c_offset_lines[i2], c_offset_lines[i2 + 1], a_offset);
				}
				// 再度valid判定
				for (let i2 = i1; i2 <= l_last; i2++) {
					if (c_offset_lines[i2]["start_m"] < c_offset_lines[i2]["length"] + c_offset_lines[i2]["end_m"]) {
						c_offset_lines[i2]["valid"] = true;
					} else {
						c_offset_lines[i2]["valid"] = false;
					}
				}
				i1 -= 1; // 逆転があった場合、再度確認
			}
			
			function f_check_intersection(a_0sx, a_0sy, a_0ex, a_0ey, a_1sx, a_1sy, a_1ex, a_1ey) {
				return (((a_1sx - a_1ex) * (a_0sy - a_1sy) + (a_1sy - a_1ey) * (a_1sx - a_0sx)) * ((a_1sx - a_1ex) * (a_0ey - a_1sy) + (a_1sy - a_1ey) * (a_1sx - a_0ex)) < 0) && (((a_0sx - a_0ex) * (a_1sy - a_0sy) + (a_0sy - a_0ey) * (a_0sx - a_1sx)) * ((a_0sx - a_0ex) * (a_1ey - a_0sy) + (a_0sy - a_0ey) * (a_0sx - a_1ex)) < 0);
			}
			
			function f_intersection_point(a_0sx, a_0sy, a_0ex, a_0ey, a_1sx, a_1sy, a_1ex, a_1ey){
				const c_0dx = a_0ex - a_0sx;
				const c_0dy = a_0ey - a_0sy;
				const c_0 = -1 * c_0dy * a_0sx + c_0dx * a_0sy;
				const c_1dx = a_1ex - a_1sx;
				const c_1dy = a_1ey - a_1sy;
				const c_1 = c_1dy * a_1sx - c_1dx * a_1sy;
				
				const c_2 = c_0dx * c_1dy - c_1dx * c_0dy;
				if(c_2 === 0){ //平行によりうまく求められないとき。
					return {
						"x": (a_0ex + a_1sx) * 0.5,
						"y": (a_0ey + a_1sy) * 0.5,
						"parallel": true
					};
				} else {
					return {
						"x": (c_0 * c_1dx + c_1 * c_0dx) / c_2,
						"y": (c_0dy * c_1 + c_1dy * c_0) / c_2,
						"parallel": false
					};
				}
			}
			
			function f_offset_point(a_line_0, a_line_1, a_offset) {
				const c_angle_0 = a_line_0["angle"];
				const c_angle_1 = a_line_1["angle"];
				// 角度の差
				let l_angle_d = c_angle_1 - c_angle_0;
				if (Math.PI < l_angle_d) {
					l_angle_d -= Math.PI * 2;
				} else if (l_angle_d <= -Math.PI) {
					l_angle_d += Math.PI * 2;
				}
				// 角度の平均
				let l_angle_m = (c_angle_1 + c_angle_0) / 2;
				if (c_angle_0 + Math.PI < c_angle_1) {
					l_angle_m = (c_angle_0 + c_angle_1 - Math.PI * 2) / 2;
				} else if (c_angle_1 <= c_angle_0 - Math.PI) {
					l_angle_m = (c_angle_0 + c_angle_1 + Math.PI * 2) / 2;
				}
				const c_offset_2 = a_offset / Math.cos(l_angle_d / 2);
				// 基準点の計算
				let l_point_x;
				let l_point_y;
				if (a_line_0["end_x"] === a_line_1["start_x"] && a_line_0["end_y"] === a_line_1["start_y"]) {
					l_point_x = a_line_1["start_x"];
					l_point_y = a_line_1["start_y"];
				} else {
					const c_intersection_point = f_intersection_point(a_line_0["start_x"], a_line_0["start_y"], a_line_0["end_x"], a_line_0["end_y"], a_line_1["start_x"], a_line_1["start_y"], a_line_1["end_x"], a_line_1["end_y"]);
					a_line_0["end_x"] = c_intersection_point["x"];
					a_line_0["end_y"] = c_intersection_point["y"];
					a_line_0["length"] = ((a_line_0["start_x"] - a_line_0["end_x"]) ** 2 + (a_line_0["start_y"] - a_line_0["end_y"]) ** 2) ** 0.5;
					a_line_1["start_x"] = c_intersection_point["x"];
					a_line_1["start_y"] = c_intersection_point["y"];
					a_line_1["length"] = ((a_line_1["start_x"] - a_line_1["end_x"]) ** 2 + (a_line_1["start_y"] - a_line_1["end_y"]) ** 2) ** 0.5;
					l_point_x = c_intersection_point["x"];
					l_point_y = c_intersection_point["y"];
				}
				// オフセット
				const c_point_x_2 = l_point_x - c_offset_2 * Math.sin(l_angle_m);
				const c_point_y_2 = l_point_y + c_offset_2 * Math.cos(l_angle_m);
				const c_angle_d_2 = (Math.PI - l_angle_d) / 2; // 0以上π未満
				let l_point_m;
				if (c_angle_d_2 === 0 || c_angle_d_2 * 2 === Math.PI) {
					l_point_m = 0;
				} else {
					l_point_m = a_offset / Math.tan(c_angle_d_2);
				}
				a_line_0["end_x_2"] = c_point_x_2;
				a_line_0["end_y_2"] = c_point_y_2;
				a_line_0["end_m"] = -1 * l_point_m;
				a_line_1["start_x_2"] = c_point_x_2;
				a_line_1["start_y_2"] = c_point_y_2;
				a_line_1["start_m"] = l_point_m;
			}
			
			// 出力
			const c_offset_points = [];
			c_offset_points.push({
				"x": c_offset_lines[0]["start_x_2"],
				"y": c_offset_lines[0]["start_y_2"]
			});
			for (let i1 = 0; i1 < c_offset_lines.length; i1++) {
				c_offset_points.push({
					"x": c_offset_lines[i1]["end_x_2"],
					"y": c_offset_lines[i1]["end_y_2"]
				});
			}
			return c_offset_points;
		};
		
		c_PolylineOffsetJoin.joinOffsetPoints = function (a_offset_points, a_options) {
			// 距離
			const c_distance = [0];
			for (let i1 = 1; i1 < a_offset_points.length; i1++) {
				c_distance.push(c_distance[c_distance.length - 1] + ((a_offset_points[i1]["x"] - a_offset_points[i1 - 1]["x"]) ** 2 + (a_offset_points[i1]["y"] - a_offset_points[i1 - 1]["y"]) ** 2) ** 0.5);
			}
			// 最初の接続
			let l_start_x = null;
			let l_start_y = null;
			let l_start_trim = null;
			let l_start_add_x = null;
			let l_start_add_y = null;
			if (a_options["pre_end_angle"] !== null) {
				let l_start_angle_d = a_options["start_angle"] - a_options["pre_end_angle"];
				if (Math.PI < l_start_angle_d) {
					l_start_angle_d -= Math.PI * 2;
				} else if (l_start_angle_d <= -Math.PI) {
					l_start_angle_d += Math.PI * 2;
				}
				l_start_trim = a_options["pre_offset"] / Math.sin(l_start_angle_d) - a_options["offset"] / Math.tan(l_start_angle_d);
				if (Math.abs(l_start_angle_d) < Math.PI / 8 || 7 * Math.PI / 8 < Math.abs(l_start_angle_d)) {
					l_start_trim = a_options["join_trim"];
					
					const c_x = a_options["join_trim"] * Math.cos(a_options["start_angle"]) - a_options["offset"] * Math.sin(a_options["start_angle"]);
					const c_y = a_options["join_trim"] * Math.sin(a_options["start_angle"]) + a_options["offset"] * Math.cos(a_options["start_angle"]);
					const c_pre_x = -1 * a_options["join_trim"] * Math.cos(a_options["pre_end_angle"]) - a_options["pre_offset"] * Math.sin(a_options["pre_end_angle"]);
					const c_pre_y = -1 * a_options["join_trim"] * Math.sin(a_options["pre_end_angle"]) + a_options["pre_offset"] * Math.cos(a_options["pre_end_angle"]);
					l_start_add_x = (c_pre_x - c_x) / 2;
					l_start_add_y = (c_pre_y - c_y) / 2;
				}
				l_start_x = a_offset_points[0]["x"] + l_start_trim * Math.cos(a_options["start_angle"]);
				l_start_y = a_offset_points[0]["y"] + l_start_trim * Math.sin(a_options["start_angle"]);
			}
			// 最後の接続
			let l_end_x = null;
			let l_end_y = null;
			let l_end_extend = null;
			let l_end_add_x = null;
			let l_end_add_y = null;
			if (a_options["post_start_angle"] !== null) {
				let l_end_angle_d = a_options["post_start_angle"] - a_options["end_angle"];
				if (Math.PI < l_end_angle_d) {
					l_end_angle_d -= Math.PI * 2;
				} else if (l_end_angle_d <= -Math.PI) {
					l_end_angle_d += Math.PI * 2;
				}
				l_end_extend = -1 * a_options["post_offset"] / Math.sin(l_end_angle_d) + a_options["offset"] / Math.tan(l_end_angle_d);
				if (Math.abs(l_end_angle_d) < a_options["min_angle"] || (Math.PI - a_options["min_angle"]) < Math.abs(l_end_angle_d)) {
					l_end_extend = -1 * a_options["join_trim"];
					
					const c_x = -1 * a_options["join_trim"] * Math.cos(a_options["end_angle"]) - a_options["offset"] * Math.sin(a_options["end_angle"]);
					const c_y = -1 * a_options["join_trim"] * Math.sin(a_options["end_angle"]) + a_options["offset"] * Math.cos(a_options["end_angle"]);
					const c_post_x = a_options["join_trim"] * Math.cos(a_options["post_start_angle"]) - a_options["post_offset"] * Math.sin(a_options["post_start_angle"]);
					const c_post_y = a_options["join_trim"] * Math.sin(a_options["post_start_angle"]) + a_options["post_offset"] * Math.cos(a_options["post_start_angle"]);
					l_end_add_x = (c_post_x - c_x) / 2;
					l_end_add_y = (c_post_y - c_y) / 2;
				}
				l_end_x = a_offset_points[a_offset_points.length - 1]["x"] + l_end_extend * Math.cos(a_options["end_angle"]);
				l_end_y = a_offset_points[a_offset_points.length - 1]["y"] + l_end_extend * Math.sin(a_options["end_angle"]);
			}
			// 反映
			if (a_options["pre_end_angle"] !== null) {
				a_offset_points[0]["x"] = l_start_x;
				a_offset_points[0]["y"] = l_start_y;
			}
			if (a_options["post_start_angle"] !== null) {
				a_offset_points[a_offset_points.length - 1]["x"] = l_end_x;
				a_offset_points[a_offset_points.length - 1]["y"] = l_end_y;
			}
			const c_joined_offset_points = [];
			for (let i1 = 0; i1 < a_offset_points.length; i1++) {
				if (i1 !== 0 && i1 !== a_offset_points.length - 1) {
					if (l_start_trim !== null && c_distance[i1] <= l_start_trim) {
						continue;
					}
					if (l_end_extend !== null && l_end_extend <= (c_distance[i1] - c_distance[c_distance.length - 1])) {
						continue;
					}
				}
				c_joined_offset_points.push(a_offset_points[i1]);
			}
			
			if (l_start_add_x !== null && l_start_add_y !== null) {
				c_joined_offset_points.unshift({"x": c_joined_offset_points[0]["x"] + l_start_add_x, "y": c_joined_offset_points[0]["y"] + l_start_add_y});
			}
			if (l_end_add_x !== null && l_end_add_x !== null) {
				c_joined_offset_points.push({"x": c_joined_offset_points[c_joined_offset_points.length - 1]["x"] + l_end_add_x, "y": c_joined_offset_points[c_joined_offset_points.length - 1]["y"] + l_end_add_y});
			}
			// 出力
			return c_joined_offset_points;
		}
		
		a_L.Polyline.include({
			_projectLatlngs: function (latlngs, result, projectedBounds) {
				if (latlngs[0] instanceof a_L.LatLng) {
					let l_ring = [];
					for (let i1 = 0; i1 < latlngs.length; i1++) {
						l_ring[i1] = this._map.latLngToLayerPoint(latlngs[i1]);
						projectedBounds.extend(l_ring[i1]);
					}
		            l_ring = a_L.PolylineOffsetJoin.offsetPoints(l_ring, this.options); // オフセット処理を追加
					result.push(l_ring);
				} else {
					for (let i1 = 0; i1 < latlngs.length; i1++) {
						this._projectLatlngs(latlngs[i1], result, projectedBounds);
					}
				}
			}
		});
		
		// Leaflet.PolylineDecorator対応
		if (a_L.PolylineDecorator !== undefined) {
			const isCoordArray = function (a1) {
				if (Array.isArray(a1) === false) {
					return false; // 配列でない
				}
				for (let i1 = 0; i1 < a1.length; i1++) {
					if (a1[i1] instanceof a_L.LatLng) {
						continue;
					}
					if (Array.isArray(a1[i1]) && a1[i1].length === 2 && typeof a1[i1][0] === "number" && typeof a1[i1][1] === "number") {
						continue;
					}
					return false; // 座標でない
				}
				return true;
			};
			
			a_L.PolylineDecorator.prototype._initPaths = function(input, isPolygon) {
				if (isCoordArray(input)) {
					if (isPolygon) {
						return [a_L.polyline(input.concat([input[0]]))];
					} else {
						return [a_L.polyline(input)];
					}
				}
				if (input instanceof a_L.Polyline) {
					return [input];
				}
				if (Array.isArray(input)) {
					const c_output = [];
					for (let i1 = 0; i1 < input.length; i1++) {
						c_output.push(this._initPaths(input[i1], isPolygon));
					}
					return c_output;
				}
				return [];
			};
			
			a_L.PolylineDecorator.prototype._initBounds = function() {
				const allPathCoords = this._paths.reduce((acc, path) => acc.concat(path.getLatLngs()), []);
				return a_L.latLngBounds(allPathCoords);
			};
			
			a_L.PolylineDecorator.prototype._getPatternLayers = function(pattern) {
				const mapBounds = this._map.getBounds().pad(0.1);
				return this._paths.map(path => {
					let l_LatLngs = path.getLatLngs();
					if (path.options.offset) {
						let l_ring = l_LatLngs.map(latLng => this._map.latLngToLayerPoint(latLng)); // 座標変換
						l_ring = a_L.PolylineOffsetJoin.offsetPoints(l_ring, path.options);
						l_LatLngs = l_ring.map(point => this._map.layerPointToLatLng(point)); // 座標変換
					}
					const directionPoints = this._getDirectionPoints(l_LatLngs, pattern).filter(point => mapBounds.contains(point.latLng));
					return a_L.featureGroup(this._buildSymbols(l_LatLngs, pattern.symbolFactory, directionPoints));
				});
			};
		}
		
		return c_PolylineOffsetJoin;
	};
	
	if (typeof define === "function" && define.amd) {
		define(["leaflet"], factory);
	} else if (typeof exports === "object") {
		module.exports = factory(require("leaflet"));
	}
	if (typeof this !== "undefined" && this.L) {
		this.L.PolylineOffsetJoin = factory(this.L);
	}
}
