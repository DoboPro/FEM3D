�t�H���_
beam	���̃T���v��		sampleBeam**.fem, sampleThickBeam**.fem
bend	�Ȃ�����̃T���v��	sampleBend**.fem
shell	���̃T���v��		shell**.fem, shellRib**.fem, 
				shellBeam**.fem, shellThickBeam**.fem, 
				shellTensTor**.fem
heat	�M��͂̃T���v��	heat**.fem
patch	�p�b�`�e�X�g�p�f�[�^	patchTest**.fem
coordinates	�Ǐ����W�n���ؗp�f�[�^	shellQuad1C**.fem
bar	���v�f�̃T���v��	barBend**.fem, barThickBend**.fem,
				barTensTor**.fem, barRect**.fem
charvib	�ŗL�U����͂̃T���v��	**Beam**.fem, **Rect1**.fem, bar1BE.fem
buckling	���`������͂̃T���v��	buck1**.fem, buck2**.fem, buck3**.fem, buck4**.fem
others	���̑����؂Ɏg�p�����G���ȃf�[�^

�@sampleBeam**.fem
��[�Œ�̗��@����L=10,��B=2,����H=1,�����O��E=21000,�׏dF=100
�AsampleThickBeam**.fem
����葾�����@����L=10,��B=2,����H=5,�����O��E=21000,�׏dF=100
�BsampleBend**.fem
���Ȃ������@X�����T�C�Y100,Y�����T�C�Y70,���̕�B=20,����H=15,�����O��E=21000,�׏dF=100
�Cshell**.fem
���@����L=100,��B=50,��T=1,�����O��E=206000,�׏dF=10
_t1,_t2�͍��W�ϊ��m�F�p�̌X�������f��
�DshellRib**.fem
���u�t�����@����L=100,��B=100,���u����H=10,��T=1,�����O��E=21000,�׏dF=10
�EshellBeam**.fem
�@�Ɠ����̗��A�V�F���v�f ����L=10,��B=2,����t=1,�����O��E=21000,�׏dF=100
�FshellThickBeam**.fem
�A�Ɠ����̗��A�V�F���v�f ����L=10,��B=2,����t=5,�����O��E=21000,�׏dF=100
�Gheat**.fem
�M��͗p�~���`	���aD1=1,�O�aD2=2,����H=2,�M�`������=1,�������͋C���xT1=20,�M�`�B��h1=1,�O�����͋C���xT2=100,�M�`�B��h2=2

���v�f��Excel�f�[�^���Q��
�ŗL�l��́i�U���E�����j��Excel�f�[�^���Q��
�������ŗL�U����͂̉ۑ�Ƃ��Ĉȉ��̓_���c���Ă���
�E�V�F���S�p�`�v�f�̐��x���s�\���A�܂��h�������O��]���R�x�ɂ��Č��ؒ�
�E�e�B���V�F���R���͌ŗL�U�����[�h�̃G���[���U�������

�v�Z���ʌ���
�@sampleBeam**.fem�i�P�����j
Z���������
�ޗ͗��_	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1��K��
9.524		6.446	9.093	8.528	9.457	9.468	9.463	9.424
�S�ʑ̂P���v�f�͗��_���d�߂��A�U�ʑ̗v�f�ł�����f���b�L���O�̉e����������B�Q���v�f����є�K���v�f�ł͗��_���ɋ߂��l��������B
�AsampleThickBeam**.fem�i�@��葾�����j
Z���������
�ޗ͗��_	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1��K��
0.0762		0.0778	0.0884	0.0875	0.0905	0.0909	0.0909	0.0894
�@�ƈႢ�����������ߍޗ͗��_�Ƃ̘�����������B
�v�f�̌X���͇@�Ɠ��l�����A�X�y�N�g�䂪�����`�ɋ߂����߂���f���b�L���O�̉e���͂�⏬�����B�i���������������ł͂Ȃ��Ǝv���B�j
���̑����K���v�f�ƂQ���v�f�̌��ʂɂ�⍷��������B
�iWilson-Taylor�̔�K���v�f�ɂ͋Ȃ��ȊO�̂���f�Ȃǂɕ␳��������Ȃ����߂��B�j
�BsampleBend**.fem�i�Ȃ�����j
Z���������
�ޗ͗��_	Tetra1	Wedge1	Hexa1	Tetra2	Wedge2	Hexa2	Hexa1��K��	�i�Q�l�jBEBar	TBar	Tri1	Quad1
0.5943		0.3952	0.5148	0.5590	0.5950	0.5968	0.5964	0.5756		0.5926		0.5990	0.4380	0.5887
�ޗ͗��_�͋Ȃ��iX�������{Y�������j�{X�����_�̝�����_�ɉ��肵�����̂Ń��t�Ȃ��̂����A�Q���v�f�͗��_���ɋ߂��l�ƂȂ��Ă���B
����f���b�L���O�̉e���͔�K���v�f�ŏ������Ȃ��Ă�����̂́A�Ȃ��ȊO�̃��[�h
�����芮�S�ɂ͖����Ȃ��Ă��Ȃ��B
�܂����v�f�i�x���k�[�C=�I�C���[���C�e�B���V�F���R���j�͗��_�l�ɋ߂��l�ƂȂ邪�A�V�F���v�f�͔��v�f�łȂ��Ƃ��኱�d�߂ɂȂ�B
�Cshell**.fem�i���j
�ő�ψ�
�ޗ͗��_	Tri1	Quad1
3.883		3.739	3.738
���Ȃ��Ɋւ��Ă͂R�p�`�E�S�p�`���ɂQ�����x�̂��ߗ��_�l�ɋ߂��l�ƂȂ�B
�DshellRib**.fem�i���u�t���j
�ő�ψ�
�i�ޗ͗��_�j	Tri1	Quad1
0.0255		0.1078	0.1134
�f�ʂ��傫���c�ݗ��_�v�Z�͂��܂�Q�l�ɂȂ�Ȃ��B���u�̖ʓ��c�����邽�߂R�p�`�ƂS�p�`�̍��������B
�EshellBeam**.fem�i�@�̗��A�V�F���v�f�j
�ޗ͗��_	Tri1	Quad1
9.524		9.325	9.453
�FshellThickBeam**.fem�i�A�̗��A�V�F���v�f�j
�ޗ͗��_	Tri1	Quad1
0.0762		0.0746	0.0899
���݂�������ł͔����V�F����MITC4�v�f�̍��������B����������̉e�����l������Quad1(MITC4)�v�f�̕����\���b�h�Q���v�f�̌��ʁ������ɋ߂��B
�F�͕��������̕����傫���Ƃ����V�F���v�f�Ƃ��Ă���܂��������Ǝv���邪�A��r�I�ǍD�ȉ��������Ă���B
�Gheat**.fem�i�~���`�M��́j
�ō����x�^�Œቷ�x
���_���i�~���j	Tetra1		Wedge1		Hexa1		Tetra2		Wedge2		Hexa2		Tri1		Quad1
87.473/70.107	87.503/70.059	87.445/70.220	87.445/70.220	87.625/70.073	87.618/70.076	87.608/70.070	87.445/70.220	87.445/70.220
�\����͂ƈႢ����f���������߂S�ʑ̂P���v�f���܂ߌ덷��0.2�ȉ��ŏ\���Ȑ��x��������B


������
�E�Q���v�f�̃��f���͐ߓ_���������v�Z���Ԃ�������܂��B
�@IE�ł͐����ȏォ���邱�Ƃ�����܂��̂ł��������������B
�E�\���b�h�Q���v�f�𒼐ډ�@�iLUP����@�j�ŉ�����
�@Chrome�ł����Ԃ�������܂��B
�i�Q�l�j��Ҋ��ł̌v�Z����
sampleBendHexa1.fem
IE		�@1sec(ILUCG),5sec(LUP)
Chrome		�`1sec(ILUCG),4sec(LUP)
��JavaApplet	�`1sec(ILUCG),�`30sec(LU)
sampleBendTetra2.fem(ILUCG)
IE		20-25sec
Chrome		4-5sec
��JavaApplet	15sec
sampleBendHexa1.fem �ŗL�U�����(�ŗL�l�P�O�AILUCG�j
IE		20-30sec
Chrome		2-3sec
�ELUP�@��Numeric.js���C�u�����Ȃ̂ŗ��΂ɍ�Ҏ���LU�@��葬���ł��B
�ENumeric.js�ɔ�����@�͖�������ILUCG�@�͉������Ҏ���ł��B
�@����Ă��̌v�Z���Ԃ͏����Ɋe���̎��͂ƍl�����܂��B
�E�v���O�����������ɂ�����ILUCG�ňȑO�̂Q�{�߂��v�Z���x�ɂȂ�܂����B
�@IE�Ɏ����Ă͍ő�T�{�߂��ɂȂ�܂��B�i����ł��x���̂ł����B�j
