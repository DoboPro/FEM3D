フォルダ
beam	梁のサンプル		sampleBeam**.fem, sampleThickBeam**.fem
bend	曲がり梁のサンプル	sampleBend**.fem
shell	薄板のサンプル		shell**.fem, shellRib**.fem, 
				shellBeam**.fem, shellThickBeam**.fem, 
				shellTensTor**.fem
heat	熱解析のサンプル	heat**.fem
patch	パッチテスト用データ	patchTest**.fem
coordinates	局所座標系検証用データ	shellQuad1C**.fem
bar	梁要素のサンプル	barBend**.fem, barThickBend**.fem,
				barTensTor**.fem, barRect**.fem
charvib	固有振動解析のサンプル	**Beam**.fem, **Rect1**.fem, bar1BE.fem
buckling	線形座屈解析のサンプル	buck1**.fem, buck2**.fem, buck3**.fem, buck4**.fem
others	その他検証に使用した雑多なデータ

�@sampleBeam**.fem
一端固定の梁　長さL=10,幅B=2,高さH=1,ヤング率E=21000,荷重F=100
�AsampleThickBeam**.fem
↑より太い梁　長さL=10,幅B=2,高さH=5,ヤング率E=21000,荷重F=100
�BsampleBend**.fem
屈曲した梁　X方向サイズ100,Y方向サイズ70,梁の幅B=20,高さH=15,ヤング率E=21000,荷重F=100
�Cshell**.fem
薄板　長さL=100,幅B=50,板厚T=1,ヤング率E=206000,荷重F=10
_t1,_t2は座標変換確認用の傾いたモデル
�DshellRib**.fem
リブ付き薄板　長さL=100,幅B=100,リブ高さH=10,板厚T=1,ヤング率E=21000,荷重F=10
�EshellBeam**.fem
�@と同等の梁、シェル要素 長さL=10,幅B=2,厚さt=1,ヤング率E=21000,荷重F=100
�FshellThickBeam**.fem
�Aと同等の梁、シェル要素 長さL=10,幅B=2,厚さt=5,ヤング率E=21000,荷重F=100
�Gheat**.fem
熱解析用円筒形	内径D1=1,外径D2=2,高さH=2,熱伝導率λ=1,内側雰囲気温度T1=20,熱伝達率h1=1,外側雰囲気温度T2=100,熱伝達率h2=2

梁要素はExcelデータを参照
固有値解析（振動・座屈）もExcelデータを参照
ただし固有振動解析の課題として以下の点が残っている
・シェル４角形要素の精度が不十分、またドリリング回転自由度について検証中
・ティモシェンコ梁は固有振動モードのエラーが散見される

計算結果検証
�@sampleBeam**.fem（単純梁）
Z方向たわみ
材力理論	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1非適合
9.524		6.446	9.093	8.528	9.457	9.468	9.463	9.424
４面体１次要素は理論より硬過ぎ、６面体要素でもせん断ロッキングの影響が見られる。２次要素および非適合要素では理論解に近い値が得られる。
�AsampleThickBeam**.fem（�@より太い梁）
Z方向たわみ
材力理論	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1非適合
0.0762		0.0778	0.0884	0.0875	0.0905	0.0909	0.0909	0.0894
�@と違い梁が太いため材力理論との乖離が見られる。
要素の傾向は�@と同様だがアスペクト比が正方形に近いためせん断ロッキングの影響はやや小さい。（高さ方向分割数ではないと思う。）
その代わり非適合要素と２次要素の結果にやや差が見られる。
（Wilson-Taylorの非適合要素には曲げ以外のせん断などに補正がかからないためか。）
�BsampleBend**.fem（曲がり梁）
Z方向たわみ
材力理論	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1非適合	（参考）BEBar	TBar	Tri1	Quad1
0.5943		0.3952	0.5148	0.5590	0.5950	0.5968	0.5964	0.5756		0.5926		0.5990	0.4380	0.5887
材力理論は曲げ（X方向梁＋Y方向梁）＋X方向棒の捩れを大胆に仮定したものでラフなものだが、２次要素は理論解に近い値となっている。
せん断ロッキングの影響は非適合要素で小さくなっているものの、曲げ以外のモード
もあり完全には無くなっていない。
また梁要素（ベルヌーイ=オイラー梁，ティモシェンコ梁）は理論値に近い値となるが、シェル要素は薄板要素でなくとも若干硬めになる。
�Cshell**.fem（薄板）
最大変位
材力理論	Tri1	Quad1
3.883		3.739	3.738
薄板曲げに関しては３角形・４角形共に２次精度のため理論値に近い値となる。
�DshellRib**.fem（リブ付き板）
最大変位
（材力理論）	Tri1	Quad1
0.0255		0.1078	0.1134
断面が大きく歪み理論計算はあまり参考にならない。リブの面内歪があるため３角形と４角形の差が現れる。
�EshellBeam**.fem（�@の梁、シェル要素）
材力理論	Tri1	Quad1
9.524		9.325	9.453
�FshellThickBeam**.fem（�Aの梁、シェル要素）
材力理論	Tri1	Quad1
0.0762		0.0746	0.0899
厚みがある梁では薄肉シェルとMITC4要素の差が現れる。何れも肉厚の影響を考慮したQuad1(MITC4)要素の方がソリッド２次要素の結果≒正解に近い。
�Fは幅より厚さの方が大きいというシェル要素としてあるまじき条件と思われるが、比較的良好な解が得られている。
�Gheat**.fem（円筒形熱解析）
最高温度／最低温度
理論解（円筒）	Tetra1		Wedge1		Hexa1		Tetra2		Wedge2		Hexa2		Tri1		Quad1
87.473/70.107	87.503/70.059	87.445/70.220	87.445/70.220	87.625/70.073	87.618/70.076	87.608/70.070	87.445/70.220	87.445/70.220
構造解析と違いせん断が無いため４面体１次要素も含め誤差は0.2以下で十分な精度が得られる。


※注意
・２次要素のモデルは節点数が多く計算時間がかかります。
　IEでは数分以上かかることもありますのでご了承ください。
・ソリッド２次要素を直接解法（LUP分解法）で解くと
　Chromeでも時間がかかります。
（参考）作者環境での計算時間
sampleBendHexa1.fem
IE		　1sec(ILUCG),5sec(LUP)
Chrome		〜1sec(ILUCG),4sec(LUP)
旧JavaApplet	〜1sec(ILUCG),〜30sec(LU)
sampleBendTetra2.fem(ILUCG)
IE		20-25sec
Chrome		4-5sec
旧JavaApplet	15sec
sampleBendHexa1.fem 固有振動解析(固有値１０個、ILUCG）
IE		20-30sec
Chrome		2-3sec
・LUP法はNumeric.jsライブラリなので流石に作者自作LU法より速いです。
・Numeric.jsに反復解法は無いためILUCG法は何れも作者自作です。
　よってこの計算時間は純粋に各環境の実力と考えられます。
・プログラム見直しにより特にILUCGで以前の２倍近い計算速度になりました。
　IEに至っては最大５倍近くになります。（それでも遅いのですが。）
