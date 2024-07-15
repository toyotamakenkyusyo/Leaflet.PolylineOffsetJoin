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
			const c_offset_points = [];
			for (let i1 = 0; i1 < a_points.length; i1++) {
				let l_angle_0 = null;
				let l_angle_1 = null;
				if (i1 !== 0) {
					l_angle_0 = Math.atan2(a_points[i1]["y"] - a_points[i1 - 1]["y"], a_points[i1]["x"] - a_points[i1 - 1]["x"]);
				}
				if (i1 !== a_points.length - 1) {
					l_angle_1 = Math.atan2(a_points[i1 + 1]["y"] - a_points[i1]["y"], a_points[i1 + 1]["x"] - a_points[i1]["x"]);
				}
				if (l_angle_0 === null) {
					l_angle_0 = l_angle_1;
				}
				if (l_angle_1 === null) {
					l_angle_1 = l_angle_0;
				}
				// 角度の差
				let l_angle_d = l_angle_1 - l_angle_0;
				if (Math.PI < l_angle_d) {
					l_angle_d -= Math.PI * 2;
				} else if (l_angle_d <= -Math.PI) {
					l_angle_d += Math.PI * 2;
				}
				// 角度の平均
				let l_angle_m = (l_angle_1 + l_angle_0) / 2;
				if (l_angle_0 + Math.PI < l_angle_1) {
					l_angle_m = (l_angle_0 + l_angle_1 - Math.PI * 2) / 2;
				} else if (l_angle_1 <= l_angle_0 - Math.PI) {
					l_angle_m = (l_angle_0 + l_angle_1 + Math.PI * 2) / 2;
				}
				const c_offset_2 = a_offset / Math.cos(l_angle_d / 2);
				c_offset_points.push({
					"x": a_points[i1]["x"] - c_offset_2 * Math.sin(l_angle_m),
					"y": a_points[i1]["y"] + c_offset_2 * Math.cos(l_angle_m)
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
