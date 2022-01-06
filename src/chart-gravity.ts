"use strict";

import Chart from "chart.js/auto";
import Handsontable from "handsontable";

import { tableCommonOptions, colors } from "./config";
import {
  linkInputs,
  throttle,
  updateLabels,
  updateTableHeight,
  changeOptions,
} from "./util";
import { round } from "./my-math";
import { HiddenColumns } from "handsontable/plugins";

/**
 *  This function is for the moon of a planet.
 *  @returns {[Handsontable, Chart]}:
 */
export function gravity(): [Handsontable, Chart] {
  document
    .getElementById("input-div")
    .insertAdjacentHTML(
      "beforeend",
      '<form title="Gravitational Wave Diagram" id="gravity-form">\n' +
        '<div class="row">\n' +
        '<div class="col-sm-5 des">Merger Time (sec):</div>\n' +
        '<div class="col-sm-4 range"><input type="range" title="Merger" name="merge"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Merger" name="merge_num" class="field"></div>\n' +
        "</div>\n" +
        '<div class="row">\n' +
        '<div class="col-sm-5 des">Distance (Mpc):</div>\n' +
        '<div class="col-sm-4 range"><input type="range" title="Distance" name="dist"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Distance" name="dist_num" class="field"></div>\n' +
        "</div>\n" +
        '<div class="row">\n' +
        '<div class="col-sm-5 des">Inclination (°):</div>\n' +
        '<div class="col-sm-4 range"><input type="range" title="Inclination" name="inc"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Inclination" name="inc_num" class="field"></div>\n' +
        "</div>\n" +
        '<div class="row">\n' +
        '<div class="col-sm-5 des">Total Mass (solar):</div>\n' +
        '<div class="col-sm-4 range"><input type="range" title="Mass" name="mass"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Mass" name="mass_num" class="field"></div>\n' +
        "</div>\n" +
        '<div class="row">\n' +
        '<div class="col-sm-5 des">Mass Ratio:</div>\n' +
        '<div class="col-sm-4 range"><input type="range" title="Ratio" name="ratio"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Ratio" name="ratio_num" class="field"></div>\n' +
        "</div>\n" +
        "</form>\n" +
        '<form title="Filters" id="filter-form" style="padding-bottom: .5em">\n' +
        '<div class="row">\n' +
        '<div class="col-sm-6" style="color: black;">Remnant Mass:</div>\n' +
        '<div class="col-sm-6" style="color: black;">Mass to Energy:</div>\n' +
        "</div>\n" 
    );

  // Link each slider with corresponding text box
  const gravityForm = document.getElementById("gravity-form") as GravityForm;
  const filterForm = document.getElementById("filter-form") as ModelForm;
  linkInputs(gravityForm["merge"], gravityForm["merge_num"], 0, 100, 0.01, 50);
  linkInputs(
    gravityForm["dist"],
    gravityForm["dist_num"],
    10,
    10000,
    0.01,
    300,
    false,
    true,
    -100000000,
    100000000
  );
  linkInputs(gravityForm["inc"], gravityForm["inc_num"], 0, 90, 0.01, 0);
  linkInputs(
    gravityForm["mass"],
    gravityForm["mass_num"],
    2.5,
    250,
    0.01,
    25,
    true
  );
  linkInputs(
    gravityForm["ratio"],
    gravityForm["ratio_num"],
    1,
    10,
    0.01,
    1,
    true
  );

  const tableData = [
    {Time:	16.25	, Strain:	-0.291476046	, Model:	-0.108538377	},
    {Time:	16.25024009	, Strain:	-0.529312202	, Model:	-0.12330947	},
    {Time:	16.25047994	, Strain:	-0.780039999	, Model:	-0.134796906	},
    {Time:	16.25073004	, Strain:	-1.013380597	, Model:	-0.142102227	},
    {Time:	16.25096989	, Strain:	-1.201134742	, Model:	-0.144604106	},
    {Time:	16.25121999	, Strain:	-1.323766944	, Model:	-0.141973894	},
    {Time:	16.25146008	, Strain:	-1.374497237	, Model:	-0.134174085	},
    {Time:	16.25169992	, Strain:	-1.359799243	, Model:	-0.121443825	},
    {Time:	16.25195003	, Strain:	-1.296247202	, Model:	-0.104274831	},
    {Time:	16.25219011	, Strain:	-1.204598196	, Model:	-0.083379681	},
    {Time:	16.25243998	, Strain:	-1.102889082	, Model:	-0.0596531	},
    {Time:	16.25268006	, Strain:	-1.000829098	, Model:	-0.034125984	},
    {Time:	16.25291991	, Strain:	-0.897397954	, Model:	-0.007911912	},
    {Time:	16.25317001	, Strain:	-0.78241505	, Model:	0.01785326	},
    {Time:	16.2534101	, Strain:	-0.641489324	, Model:	0.042076537	},
    {Time:	16.25365996	, Strain:	-0.462624128	, Model:	0.063773674	},
    {Time:	16.25390005	, Strain:	-0.242163137	, Model:	0.082130329	},
    {Time:	16.25414991	, Strain:	0.011928634	, Model:	0.096552274	},
    {Time:	16.25439	, Strain:	0.280346109	, Model:	0.106698913	},
    {Time:	16.25463009	, Strain:	0.535988601	, Model:	0.112496045	},
    {Time:	16.25487995	, Strain:	0.749746987	, Model:	0.114126476	},
    {Time:	16.25512004	, Strain:	0.897155326	, Model:	0.112000317	},
    {Time:	16.2553699	, Strain:	0.964282269	, Model:	0.106709794	},
    {Time:	16.25560999	, Strain:	0.951267327	, Model:	0.098975559	},
    {Time:	16.25585008	, Strain:	0.872480023	, Model:	0.089592203	},
    {Time:	16.25609994	, Strain:	0.753261958	, Model:	0.079379751	},
    {Time:	16.25634003	, Strain:	0.624160997	, Model:	0.069145462	},
    {Time:	16.25658989	, Strain:	0.514122161	, Model:	0.059656903	},
    {Time:	16.25682998	, Strain:	0.444164151	, Model:	0.051623713	},
    {Time:	16.25708008	, Strain:	0.422802832	, Model:	0.045682797	},
    {Time:	16.25731993	, Strain:	0.444141445	, Model:	0.042380488	},
    {Time:	16.25756001	, Strain:	0.489196116	, Model:	0.042146106	},
    {Time:	16.25781012	, Strain:	0.530481132	, Model:	0.045254127	},
    {Time:	16.25804996	, Strain:	0.539082247	, Model:	0.051776462	},
    {Time:	16.25830007	, Strain:	0.492680655	, Model:	0.06153109	},
    {Time:	16.25853992	, Strain:	0.382570072	, Model:	0.074037375	},
    {Time:	16.25878	, Strain:	0.217738353	, Model:	0.088490764	},
    {Time:	16.2590301	, Strain:	0.024604854	, Model:	0.103769256	},
    {Time:	16.25926995	, Strain:	-0.158017795	, Model:	0.118480975	},
    {Time:	16.25952005	, Strain:	-0.287974286	, Model:	0.131056405	},
    {Time:	16.2597599	, Strain:	-0.330885467	, Model:	0.139881511	},
    {Time:	16.25999999	, Strain:	-0.270413997	, Model:	0.143460161	},
    {Time:	16.26025009	, Strain:	-0.114493752	, Model:	0.140587609	},
    {Time:	16.26048994	, Strain:	0.104680045	, Model:	0.130512619	},
    {Time:	16.26074004	, Strain:	0.337164876	, Model:	0.113065011	},
    {Time:	16.26097989	, Strain:	0.526605029	, Model:	0.088728466	},
    {Time:	16.26122999	, Strain:	0.623455572	, Model:	0.058644815	},
    {Time:	16.26147008	, Strain:	0.596809421	, Model:	0.024544906	},
    {Time:	16.26170993	, Strain:	0.441985769	, Model:	-0.011389041	},
    {Time:	16.26196003	, Strain:	0.182064741	, Model:	-0.046715501	},
    {Time:	16.26220012	, Strain:	-0.137086739	, Model:	-0.078958903	},
    {Time:	16.26244998	, Strain:	-0.457228789	, Model:	-0.105842877	},
    {Time:	16.26269007	, Strain:	-0.721060633	, Model:	-0.125505826	},
    {Time:	16.26292992	, Strain:	-0.884931255	, Model:	-0.136676071	},
    {Time:	16.26318002	, Strain:	-0.927584984	, Model:	-0.138789404	},
    {Time:	16.2634201	, Strain:	-0.852989049	, Model:	-0.132039026	},
    {Time:	16.26366997	, Strain:	-0.687363294	, Model:	-0.117355393	},
    {Time:	16.26391006	, Strain:	-0.47217763	, Model:	-0.096320432	},
    {Time:	16.26415992	, Strain:	-0.255393215	, Model:	-0.071026142	},
    {Time:	16.26440001	, Strain:	-0.082774227	, Model:	-0.043891409	},
    {Time:	16.26464009	, Strain:	0.009606039	, Model:	-0.017453048	},
    {Time:	16.26488996	, Strain:	0.000963601	, Model:	0.005852164	},
    {Time:	16.26513004	, Strain:	-0.111064383	, Model:	0.023897889	},
    {Time:	16.26537991	, Strain:	-0.310147697	, Model:	0.035055314	},
    {Time:	16.26561999	, Strain:	-0.563798081	, Model:	0.038342397	},
    {Time:	16.26586008	, Strain:	-0.828158257	, Model:	0.033522468	},
    {Time:	16.26610994	, Strain:	-1.054326132	, Model:	0.021141822	},
    {Time:	16.26635003	, Strain:	-1.195652738	, Model:	0.002499394	},
    {Time:	16.26659989	, Strain:	-1.215479379	, Model:	-0.020453654	},
    {Time:	16.26683998	, Strain:	-1.094393197	, Model:	-0.04528058	},
    {Time:	16.26708007	, Strain:	-0.835528679	, Model:	-0.069281233	},
    {Time:	16.26732993	, Strain:	-0.466208775	, Model:	-0.089751945	},
    {Time:	16.26757002	, Strain:	-0.034670801	, Model:	-0.104259177	},
    {Time:	16.26781988	, Strain:	0.398156194	, Model:	-0.110898707	},
    {Time:	16.26805997	, Strain:	0.770271362	, Model:	-0.108510956	},
    {Time:	16.26831007	, Strain:	1.030911519	, Model:	-0.096825525	},
    {Time:	16.26854992	, Strain:	1.150643609	, Model:	-0.076514358	},
    {Time:	16.26879001	, Strain:	1.126980035	, Model:	-0.049142706	},
    {Time:	16.26904011	, Strain:	0.984357865	, Model:	-0.01701918	},
    {Time:	16.26927996	, Strain:	0.768603636	, Model:	0.017040904	},
    {Time:	16.26953006	, Strain:	0.537237955	, Model:	0.050012905	},
    {Time:	16.26976991	, Strain:	0.347866646	, Model:	0.078986073	},
    {Time:	16.27000999	, Strain:	0.247214458	, Model:	0.101473351	},
    {Time:	16.2702601	, Strain:	0.262989233	, Model:	0.11566958	},
    {Time:	16.27049994	, Strain:	0.399821335	, Model:	0.120626448	},
    {Time:	16.27075005	, Strain:	0.639383828	, Model:	0.116323777	},
    {Time:	16.27098989	, Strain:	0.943984902	, Model:	0.103631018	},
    {Time:	16.27124	, Strain:	1.262695636	, Model:	0.084167896	},
    {Time:	16.27148008	, Strain:	1.539224915	, Model:	0.060086679	},
    {Time:	16.27171993	, Strain:	1.720848655	, Model:	0.033808366	},
    {Time:	16.27197003	, Strain:	1.767459317	, Model:	0.007749675	},
    {Time:	16.27220988	, Strain:	1.6592696	, Model:	-0.015923458	},
    {Time:	16.27245998	, Strain:	1.401256203	, Model:	-0.035486743	},
    {Time:	16.27270007	, Strain:	1.022607941	, Model:	-0.049774253	},
    {Time:	16.27293992	, Strain:	0.570584517	, Model:	-0.058215155	},
    {Time:	16.27319002	, Strain:	0.100038906	, Model:	-0.0607971	},
    {Time:	16.27343011	, Strain:	-0.338441561	, Model:	-0.057973104	},
    {Time:	16.27367997	, Strain:	-0.708180504	, Model:	-0.050535037	},
    {Time:	16.27392006	, Strain:	-0.991066741	, Model:	-0.039478506	},
    {Time:	16.27416992	, Strain:	-1.186363365	, Model:	-0.025880962	},
    {Time:	16.27441001	, Strain:	-1.30493176	, Model:	-0.010808364	},
    {Time:	16.2746501	, Strain:	-1.361510539	, Model:	0.004742907	},
    {Time:	16.27489996	, Strain:	-1.367983795	, Model:	0.019870946	},
    {Time:	16.27514005	, Strain:	-1.329919608	, Model:	0.033769318	},
    {Time:	16.27538991	, Strain:	-1.247232991	, Model:	0.045717578	},
    {Time:	16.27563	, Strain:	-1.118030125	, Model:	0.05507533	},
    {Time:	16.27587008	, Strain:	-0.943418053	, Model:	0.061290736	},
    {Time:	16.27611995	, Strain:	-0.731008051	, Model:	0.063928718	},
    {Time:	16.27636003	, Strain:	-0.495791001	, Model:	0.062717042	},
    {Time:	16.2766099	, Strain:	-0.258290242	, Model:	0.057601849	},
    {Time:	16.27684999	, Strain:	-0.040840483	, Model:	0.048799312	},
    {Time:	16.27709007	, Strain:	0.136722069	, Model:	0.036828251	},
    {Time:	16.27733994	, Strain:	0.260710379	, Model:	0.022509932	},
    {Time:	16.27758002	, Strain:	0.325704609	, Model:	0.006925984	},
    {Time:	16.27782989	, Strain:	0.334881729	, Model:	-0.008667647	},
    {Time:	16.27806997	, Strain:	0.298961379	, Model:	-0.022964685	},
    {Time:	16.27832007	, Strain:	0.234440716	, Model:	-0.034756665	},
    {Time:	16.27855992	, Strain:	0.161435004	, Model:	-0.043085577	},
    {Time:	16.27880001	, Strain:	0.100914191	, Model:	-0.0473784	},
    {Time:	16.27905011	, Strain:	0.071143941	, Model:	-0.047541718	},
    {Time:	16.27928996	, Strain:	0.083767804	, Model:	-0.043999106	},
    {Time:	16.27954006	, Strain:	0.140566269	, Model:	-0.037661705	},
    {Time:	16.27977991	, Strain:	0.231992705	, Model:	-0.029832143	},
    {Time:	16.28002	, Strain:	0.33817041	, Model:	-0.022052198	},
    {Time:	16.2802701	, Strain:	0.432415693	, Model:	-0.01591357	},
    {Time:	16.28050995	, Strain:	0.486712665	, Model:	-0.012857287	},
    {Time:	16.28076005	, Strain:	0.478011199	, Model:	-0.013989536	},
    {Time:	16.2809999	, Strain:	0.39384643	, Model:	-0.019939547	},
    {Time:	16.28125	, Strain:	0.235712515	, Model:	-0.030778962	},
    {Time:	16.28149009	, Strain:	0.019040489	, Model:	-0.046012878	},
    {Time:	16.28172994	, Strain:	-0.230393437	, Model:	-0.06464195	},
    {Time:	16.28198004	, Strain:	-0.482554818	, Model:	-0.085284553	},
    {Time:	16.28221989	, Strain:	-0.709785401	, Model:	-0.106339508	},
    {Time:	16.28246999	, Strain:	-0.892077092	, Model:	-0.126164947	},
    {Time:	16.28271008	, Strain:	-1.019917617	, Model:	-0.143247982	},
    {Time:	16.28294992	, Strain:	-1.094548186	, Model:	-0.156343232	},
    {Time:	16.28320003	, Strain:	-1.125872514	, Model:	-0.164564997	},
    {Time:	16.28344011	, Strain:	-1.128350146	, Model:	-0.167426715	},
    {Time:	16.28368998	, Strain:	-1.115569452	, Model:	-0.164830501	},
    {Time:	16.28393006	, Strain:	-1.094896918	, Model:	-0.157017255	},
    {Time:	16.28416991	, Strain:	-1.064050019	, Model:	-0.144492752	},
    {Time:	16.28442001	, Strain:	-1.011045236	, Model:	-0.12794638	},
    {Time:	16.2846601	, Strain:	-0.917744611	, Model:	-0.10817696	},
    {Time:	16.28490996	, Strain:	-0.765813055	, Model:	-0.086035089	},
    {Time:	16.28515005	, Strain:	-0.543097296	, Model:	-0.062385118	},
    {Time:	16.28539991	, Strain:	-0.248568447	, Model:	-0.038083786	},
    {Time:	16.28564	, Strain:	0.105310582	, Model:	-0.013968177	},
    {Time:	16.28588009	, Strain:	0.493184966	, Model:	0.009156104	},
    {Time:	16.28612995	, Strain:	0.88019458	, Model:	0.030534387	},
    {Time:	16.28637004	, Strain:	1.227426339	, Model:	0.049494225	},
    {Time:	16.2866199	, Strain:	1.498208262	, Model:	0.065487578	},
    {Time:	16.28685999	, Strain:	1.663851711	, Model:	0.078137768	},
    {Time:	16.28710008	, Strain:	1.707758705	, Model:	0.087281273	},
    {Time:	16.28734994	, Strain:	1.627360915	, Model:	0.092992994	},
    {Time:	16.28759003	, Strain:	1.433884131	, Model:	0.095585245	},
    {Time:	16.28783989	, Strain:	1.150386952	, Model:	0.095575082	},
    {Time:	16.28807998	, Strain:	0.808805149	, Model:	0.093621003	},
    {Time:	16.28833008	, Strain:	0.446610651	, Model:	0.090437029	},
    {Time:	16.28856993	, Strain:	0.103166794	, Model:	0.086698175	},
    {Time:	16.28881001	, Strain:	-0.184601347	, Model:	0.082954711	},
    {Time:	16.28906012	, Strain:	-0.387409473	, Model:	0.07957244	},
    {Time:	16.28929996	, Strain:	-0.488960982	, Model:	0.076712075	},
    {Time:	16.28955007	, Strain:	-0.489722348	, Model:	0.074353357	},
    {Time:	16.28978992	, Strain:	-0.407207396	, Model:	0.072360184	},
    {Time:	16.29003	, Strain:	-0.271839551	, Model:	0.070573707	},
    {Time:	16.2902801	, Strain:	-0.119277974	, Model:	0.068913195	},
    {Time:	16.29051995	, Strain:	0.018291923	, Model:	0.067461238	},
    {Time:	16.29077005	, Strain:	0.118987557	, Model:	0.066511491	},
    {Time:	16.2910099	, Strain:	0.174182444	, Model:	0.06656373	},
    {Time:	16.29124999	, Strain:	0.187160676	, Model:	0.068261243	},
    {Time:	16.29150009	, Strain:	0.168520418	, Model:	0.072277675	},
    {Time:	16.29173994	, Strain:	0.130304936	, Model:	0.079171814	},
    {Time:	16.29199004	, Strain:	0.081008074	, Model:	0.089237027	},
    {Time:	16.29222989	, Strain:	0.023023182	, Model:	0.102375335	},
    {Time:	16.29247999	, Strain:	-0.046892527	, Model:	0.118023474	},
    {Time:	16.29272008	, Strain:	-0.134554319	, Model:	0.135150025	},
    {Time:	16.29295993	, Strain:	-0.243820578	, Model:	0.152330409	},
    {Time:	16.29321003	, Strain:	-0.372102999	, Model:	0.167892363	},
    {Time:	16.29345012	, Strain:	-0.507453543	, Model:	0.180111466	},
    {Time:	16.29369998	, Strain:	-0.628452704	, Model:	0.187426721	},
    {Time:	16.29394007	, Strain:	-0.707400055	, Model:	0.188642276	},
    {Time:	16.29417992	, Strain:	-0.716216197	, Model:	0.183083568	},
    {Time:	16.29443002	, Strain:	-0.633418025	, Model:	0.170684284	},
    {Time:	16.2946701	, Strain:	-0.450130908	, Model:	0.151992566	},
    {Time:	16.29491997	, Strain:	-0.173578885	, Model:	0.128098685	},
    {Time:	16.29516006	, Strain:	0.172543467	, Model:	0.100499001	},
    {Time:	16.29540992	, Strain:	0.550608244	, Model:	0.070920217	},
    {Time:	16.29565001	, Strain:	0.913975856	, Model:	0.041132137	},
    {Time:	16.29589009	, Strain:	1.213741088	, Model:	0.012775857	},
    {Time:	16.29613996	, Strain:	1.406564799	, Model:	-0.012771651	},
    {Time:	16.29638004	, Strain:	1.462436558	, Model:	-0.034484736	},
    {Time:	16.29662991	, Strain:	1.370875679	, Model:	-0.051726294	},
    {Time:	16.29686999	, Strain:	1.14412845	, Model:	-0.064242099	},
    {Time:	16.29711008	, Strain:	0.816393944	, Model:	-0.072125196	},
    {Time:	16.29735994	, Strain:	0.438872255	, Model:	-0.075765122	},
    {Time:	16.29760003	, Strain:	0.071294038	, Model:	-0.075794612	},
    {Time:	16.29784989	, Strain:	-0.228640927	, Model:	-0.073041237	},
    {Time:	16.29808998	, Strain:	-0.415952279	, Model:	-0.068484824	},
    {Time:	16.29833007	, Strain:	-0.466997868	, Model:	-0.06321551	},
    {Time:	16.29857993	, Strain:	-0.384044307	, Model:	-0.058383641	},
    {Time:	16.29882002	, Strain:	-0.194629909	, Model:	-0.055132638	},
    {Time:	16.29906988	, Strain:	0.054183882	, Model:	-0.054509742	},
    {Time:	16.29930997	, Strain:	0.305360327	, Model:	-0.057356385	},
    {Time:	16.29956007	, Strain:	0.503139981	, Model:	-0.064188241	},
    {Time:	16.29979992	, Strain:	0.603649354	, Model:	-0.0750826	},
    {Time:	16.30004001	, Strain:	0.582726188	, Model:	-0.089595494	},
    {Time:	16.30029011	, Strain:	0.439436137	, Model:	-0.10673126	},
    {Time:	16.30052996	, Strain:	0.194707225	, Model:	-0.124982323	},
    {Time:	16.30078006	, Strain:	-0.114388218	, Model:	-0.142447302	},
    {Time:	16.30101991	, Strain:	-0.443230079	, Model:	-0.157022707	},
    {Time:	16.30125999	, Strain:	-0.749113243	, Model:	-0.166649701	},
    {Time:	16.3015101	, Strain:	-0.999460141	, Model:	-0.169585567	},
    {Time:	16.30174994	, Strain:	-1.176926803	, Model:	-0.164661821	},
    {Time:	16.30200005	, Strain:	-1.280189398	, Model:	-0.151489365	},
    {Time:	16.30223989	, Strain:	-1.32027541	, Model:	-0.130576177	},
    {Time:	16.30249	, Strain:	-1.313650134	, Model:	-0.103334238	},
    {Time:	16.30273008	, Strain:	-1.274374561	, Model:	-0.071968105	},
    {Time:	16.30296993	, Strain:	-1.207942304	, Model:	-0.039254951	},
    {Time:	16.30322003	, Strain:	-1.10873517	, Model:	-0.008242341	},
    {Time:	16.30345988	, Strain:	-0.961802753	, Model:	0.018097535	},
    {Time:	16.30370998	, Strain:	-0.748443736	, Model:	0.037211845	},
    {Time:	16.30395007	, Strain:	-0.454192985	, Model:	0.047264413	},
    {Time:	16.30418992	, Strain:	-0.077303189	, Model:	0.047348542	},
    {Time:	16.30444002	, Strain:	0.364473807	, Model:	0.037590036	},
    {Time:	16.30468011	, Strain:	0.831010889	, Model:	0.019130747	},
    {Time:	16.30492997	, Strain:	1.262528525	, Model:	-0.006000943	},
    {Time:	16.30517006	, Strain:	1.588404007	, Model:	-0.03511218	},
    {Time:	16.30541992	, Strain:	1.740845061	, Model:	-0.065129594	},
    {Time:	16.30566001	, Strain:	1.670540998	, Model:	-0.092909546	},
    {Time:	16.3059001	, Strain:	1.360408324	, Model:	-0.115539342	},
    {Time:	16.30614996	, Strain:	0.83365797	, Model:	-0.130598961	},
    {Time:	16.30639005	, Strain:	0.153712038	, Model:	-0.136360876	},
    {Time:	16.30663991	, Strain:	-0.584410657	, Model:	-0.131915157	},
    {Time:	16.30688	, Strain:	-1.269515399	, Model:	-0.117216482	},
    {Time:	16.30712008	, Strain:	-1.793323821	, Model:	-0.093057776	},
    {Time:	16.30736995	, Strain:	-2.069611652	, Model:	-0.060980998	},
    {Time:	16.30761003	, Strain:	-2.049947799	, Model:	-0.023138958	},
    {Time:	16.3078599	, Strain:	-1.733164926	, Model:	0.017876823	},
    {Time:	16.30809999	, Strain:	-1.166650991	, Model:	0.059227753	},
    {Time:	16.30834007	, Strain:	-0.438941565	, Model:	0.098026306	},
    {Time:	16.30858994	, Strain:	0.335276347	, Model:	0.131529481	},
    {Time:	16.30883002	, Strain:	1.035087704	, Model:	0.157318001	},
    {Time:	16.30907989	, Strain:	1.554386266	, Model:	0.173452969	},
    {Time:	16.30931997	, Strain:	1.819824317	, Model:	0.17860269	},
    {Time:	16.30957007	, Strain:	1.802090692	, Model:	0.172133243	},
    {Time:	16.30980992	, Strain:	1.51838085	, Model:	0.15415748	},
    {Time:	16.31005001	, Strain:	1.025828751	, Model:	0.125538568	},
    {Time:	16.31030011	, Strain:	0.407753077	, Model:	0.087846124	},
    {Time:	16.31053996	, Strain:	-0.243610778	, Model:	0.043265454	},
    {Time:	16.31079006	, Strain:	-0.843432249	, Model:	-0.005536881	},
    {Time:	16.31102991	, Strain:	-1.325945509	, Model:	-0.05558498	},
    {Time:	16.31127	, Strain:	-1.649697836	, Model:	-0.103793881	},
    {Time:	16.3115201	, Strain:	-1.796898035	, Model:	-0.14718638	},
    {Time:	16.31175995	, Strain:	-1.768999902	, Model:	-0.183112193	},
    {Time:	16.31201005	, Strain:	-1.581157483	, Model:	-0.20945353	},
    {Time:	16.3122499	, Strain:	-1.257663438	, Model:	-0.224800242	},
    {Time:	16.3125	, Strain:	-0.829345175	, Model:	-0.228578029	},
    {Time:	16.31274009	, Strain:	-0.332599879	, Model:	-0.221114938	},
    {Time:	16.31297994	, Strain:	0.191183557	, Model:	-0.203634913	},
    {Time:	16.31323004	, Strain:	0.697146324	, Model:	-0.178172443	},
    {Time:	16.31346989	, Strain:	1.140010556	, Model:	-0.147409212	},
    {Time:	16.31371999	, Strain:	1.478368116	, Model:	-0.114441578	},
    {Time:	16.31396008	, Strain:	1.679533711	, Model:	-0.082495938	},
    {Time:	16.31419992	, Strain:	1.724327444	, Model:	-0.054616477	},
    {Time:	16.31445003	, Strain:	1.61113422	, Model:	-0.033355438	},
    {Time:	16.31469011	, Strain:	1.358277722	, Model:	-0.020498783	},
    {Time:	16.31493998	, Strain:	1.003404149	, Model:	-0.016859209	},
    {Time:	16.31518006	, Strain:	0.59876664	, Model:	-0.022163462	},
    {Time:	16.31541991	, Strain:	0.202421662	, Model:	-0.0350521	},
    {Time:	16.31567001	, Strain:	-0.132929675	, Model:	-0.053197856	},
    {Time:	16.3159101	, Strain:	-0.370371804	, Model:	-0.073534987	},
    {Time:	16.31615996	, Strain:	-0.495304421	, Model:	-0.092578191	},
    {Time:	16.31640005	, Strain:	-0.5162088	, Model:	-0.106797652	},
    {Time:	16.31664991	, Strain:	-0.459813533	, Model:	-0.11300842	},
    {Time:	16.31689	, Strain:	-0.36256175	, Model:	-0.108728985	},
    {Time:	16.31713009	, Strain:	-0.261050283	, Model:	-0.092466281	},
    {Time:	16.31737995	, Strain:	-0.183852349	, Model:	-0.063892364	},
    {Time:	16.31762004	, Strain:	-0.146265752	, Model:	-0.023890728	},
    {Time:	16.3178699	, Strain:	-0.148577466	, Model:	0.025534018	},
    {Time:	16.31810999	, Strain:	-0.177715606	, Model:	0.081472603	},
    {Time:	16.31835008	, Strain:	-0.211640824	, Model:	0.140427671	},
    {Time:	16.31859994	, Strain:	-0.225356828	, Model:	0.198692147	},
    {Time:	16.31884003	, Strain:	-0.19707854	, Model:	0.252743619	},
    {Time:	16.31908989	, Strain:	-0.113181325	, Model:	0.299607189	},
    {Time:	16.31932998	, Strain:	0.028884023	, Model:	0.337143507	},
    {Time:	16.31958008	, Strain:	0.219879157	, Model:	0.364228327	},
    {Time:	16.31981993	, Strain:	0.440105334	, Model:	0.38080385	},
    {Time:	16.32006001	, Strain:	0.66252737	, Model:	0.387798639	},
    {Time:	16.32031012	, Strain:	0.857312982	, Model:	0.386929835	},
    {Time:	16.32054996	, Strain:	0.997163461	, Model:	0.380416696	},
    {Time:	16.32080007	, Strain:	1.062630265	, Model:	0.370645964	},
    {Time:	16.32103992	, Strain:	1.046477636	, Model:	0.359835534	},
    {Time:	16.32128	, Strain:	0.955994835	, Model:	0.349742483	},
    {Time:	16.3215301	, Strain:	0.812189559	, Model:	0.341454511	},
    {Time:	16.32176995	, Strain:	0.645337805	, Model:	0.335291197	},
    {Time:	16.32202005	, Strain:	0.487487965	, Model:	0.330824977	},
    {Time:	16.3222599	, Strain:	0.363828478	, Model:	0.327013815	},
    {Time:	16.32249999	, Strain:	0.28563024	, Model:	0.322420965	},
    {Time:	16.32275009	, Strain:	0.247251518	, Model:	0.315484534	},
    {Time:	16.32298994	, Strain:	0.228505099	, Model:	0.304792845	},
    {Time:	16.32324004	, Strain:	0.201985215	, Model:	0.289321825	},
    {Time:	16.32347989	, Strain:	0.143235396	, Model:	0.268597897	},
    {Time:	16.32372999	, Strain:	0.040441127	, Model:	0.242762768	},
    {Time:	16.32397008	, Strain:	-0.099810902	, Model:	0.21253314	},
    {Time:	16.32420993	, Strain:	-0.253016817	, Model:	0.179065842	},
    {Time:	16.32446003	, Strain:	-0.383670473	, Model:	0.143754385	},
    {Time:	16.32470012	, Strain:	-0.45647854	, Model:	0.107993899	},
    {Time:	16.32494998	, Strain:	-0.448134744	, Model:	0.072956038	},
    {Time:	16.32519007	, Strain:	-0.355666277	, Model:	0.039413018	},
    {Time:	16.32542992	, Strain:	-0.198591985	, Model:	0.007640951	},
    {Time:	16.32568002	, Strain:	-0.014301108	, Model:	-0.022581327	},
    {Time:	16.3259201	, Strain:	0.151727333	, Model:	-0.051878289	},
    {Time:	16.32616997	, Strain:	0.257766444	, Model:	-0.081105309	},
    {Time:	16.32641006	, Strain:	0.276229152	, Model:	-0.111127854	},
    {Time:	16.32665992	, Strain:	0.199692492	, Model:	-0.142590638	},
    {Time:	16.32690001	, Strain:	0.041086379	, Model:	-0.175716923	},
    {Time:	16.32714009	, Strain:	-0.171553518	, Model:	-0.210173492	},
    {Time:	16.32738996	, Strain:	-0.403724732	, Model:	-0.245026382	},
    {Time:	16.32763004	, Strain:	-0.623634681	, Model:	-0.278798118	},
    {Time:	16.32787991	, Strain:	-0.80925868	, Model:	-0.309621244	},
    {Time:	16.32811999	, Strain:	-0.951613806	, Model:	-0.335467971	},
    {Time:	16.32836008	, Strain:	-1.053985701	, Model:	-0.354424012	},
    {Time:	16.32860994	, Strain:	-1.128145759	, Model:	-0.364967872	},
    {Time:	16.32885003	, Strain:	-1.189259457	, Model:	-0.366215912	},
    {Time:	16.32909989	, Strain:	-1.251007787	, Model:	-0.358098252	},
    {Time:	16.32933998	, Strain:	-1.321740181	, Model:	-0.341440122	},
    {Time:	16.32958007	, Strain:	-1.401846073	, Model:	-0.317936047	},
    {Time:	16.32982993	, Strain:	-1.48238469	, Model:	-0.290018181	},
    {Time:	16.33007002	, Strain:	-1.545271961	, Model:	-0.260633408	},
    {Time:	16.33031988	, Strain:	-1.565528709	, Model:	-0.232954634	},
    {Time:	16.33055997	, Strain:	-1.515802563	, Model:	-0.210058998	},
    {Time:	16.33081007	, Strain:	-1.372538204	, Model:	-0.194608838	},
    {Time:	16.33104992	, Strain:	-1.122265151	, Model:	-0.188570209	},
    {Time:	16.33129001	, Strain:	-0.76618824	, Model:	-0.192999028	},
    {Time:	16.33154011	, Strain:	-0.321833276	, Model:	-0.207917242	},
    {Time:	16.33177996	, Strain:	0.17853833	, Model:	-0.232291766	},
    {Time:	16.33203006	, Strain:	0.692269549	, Model:	-0.264118282	},
    {Time:	16.33226991	, Strain:	1.172541928	, Model:	-0.300601384	},
    {Time:	16.33250999	, Strain:	1.575423585	, Model:	-0.3384129	},
    {Time:	16.3327601	, Strain:	1.866382916	, Model:	-0.374002381	},
    {Time:	16.33299994	, Strain:	2.024778655	, Model:	-0.403928579	},
    {Time:	16.33325005	, Strain:	2.045238042	, Model:	-0.425178575	},
    {Time:	16.33348989	, Strain:	1.935845693	, Model:	-0.435442524	},
    {Time:	16.33374	, Strain:	1.714220469	, Model:	-0.433316603	},
    {Time:	16.33398008	, Strain:	1.403261524	, Model:	-0.41841428	},
    {Time:	16.33421993	, Strain:	1.028230005	, Model:	-0.391375843	},
    {Time:	16.33447003	, Strain:	0.615907321	, Model:	-0.353777079	},
    {Time:	16.33470988	, Strain:	0.195301725	, Model:	-0.307949009	},
    {Time:	16.33495998	, Strain:	-0.201542528	, Model:	-0.256730288	},
    {Time:	16.33520007	, Strain:	-0.540215053	, Model:	-0.203181109	},
    {Time:	16.33543992	, Strain:	-0.787042867	, Model:	-0.150291164	},
    {Time:	16.33569002	, Strain:	-0.914475642	, Model:	-0.100713863	},
    {Time:	16.33593011	, Strain:	-0.907448235	, Model:	-0.056554543	},
    {Time:	16.33617997	, Strain:	-0.768726951	, Model:	-0.01923237	},
    {Time:	16.33642006	, Strain:	-0.521332119	, Model:	0.01057472	},
    {Time:	16.33666992	, Strain:	-0.206868771	, Model:	0.032903905	},
    {Time:	16.33691001	, Strain:	0.120382071	, Model:	0.048412243	},
    {Time:	16.3371501	, Strain:	0.402697355	, Model:	0.058232171	},
    {Time:	16.33739996	, Strain:	0.589586602	, Model:	0.063801721	},
    {Time:	16.33764005	, Strain:	0.647448671	, Model:	0.066693689	},
    {Time:	16.33788991	, Strain:	0.565905984	, Model:	0.068464491	},
    {Time:	16.33813	, Strain:	0.359341929	, Model:	0.070537292	},
    {Time:	16.33837008	, Strain:	0.063304728	, Model:	0.074126321	},
    {Time:	16.33861995	, Strain:	-0.273400285	, Model:	0.080201721	},
    {Time:	16.33886003	, Strain:	-0.599067011	, Model:	0.089487943	},
    {Time:	16.3391099	, Strain:	-0.869325497	, Model:	0.102484635	},
    {Time:	16.33934999	, Strain:	-1.054652283	, Model:	0.119497546	},
    {Time:	16.33959007	, Strain:	-1.143390091	, Model:	0.140668104	},
    {Time:	16.33983994	, Strain:	-1.140077325	, Model:	0.165993447	},
    {Time:	16.34008002	, Strain:	-1.060509854	, Model:	0.195332956	},
    {Time:	16.34032989	, Strain:	-0.925760088	, Model:	0.228401681	},
    {Time:	16.34056997	, Strain:	-0.757022511	, Model:	0.264754687	},
    {Time:	16.34082007	, Strain:	-0.572213617	, Model:	0.303768633	},
    {Time:	16.34105992	, Strain:	-0.384506143	, Model:	0.344627623	},
    {Time:	16.34130001	, Strain:	-0.202574031	, Model:	0.386319824	},
    {Time:	16.34155011	, Strain:	-0.032017357	, Model:	0.427649793	},
    {Time:	16.34178996	, Strain:	0.122797975	, Model:	0.467269604	},
    {Time:	16.34204006	, Strain:	0.257277426	, Model:	0.503729963	},
    {Time:	16.34227991	, Strain:	0.366163719	, Model:	0.535550791	},
    {Time:	16.34252	, Strain:	0.444538158	, Model:	0.561309186	},
    {Time:	16.3427701	, Strain:	0.490182681	, Model:	0.579740981	},
    {Time:	16.34300995	, Strain:	0.50648993	, Model:	0.589850133	},
    {Time:	16.34326005	, Strain:	0.504467551	, Model:	0.591017824	},
    {Time:	16.3434999	, Strain:	0.502299129	, Model:	0.583100682	},
    {Time:	16.34375	, Strain:	0.521645457	, Model:	0.566505438	},
    {Time:	16.34399009	, Strain:	0.58128919	, Model:	0.542226303	},
    {Time:	16.34422994	, Strain:	0.690225955	, Model:	0.511832181	},
    {Time:	16.34448004	, Strain:	0.842973808	, Model:	0.477393932	},
    {Time:	16.34471989	, Strain:	1.019231884	, Model:	0.441347647	},
    {Time:	16.34496999	, Strain:	1.188409766	, Model:	0.406297702	},
    {Time:	16.34521008	, Strain:	1.317743108	, Model:	0.37477264	},
    {Time:	16.34544992	, Strain:	1.381423319	, Model:	0.348956131	},
    {Time:	16.34570003	, Strain:	1.367890679	, Model:	0.330422863	},
    {Time:	16.34594011	, Strain:	1.283225369	, Model:	0.319913608	},
    {Time:	16.34618998	, Strain:	1.149873903	, Model:	0.317183364	},
    {Time:	16.34643006	, Strain:	1.001091452	, Model:	0.320950878	},
    {Time:	16.34666991	, Strain:	0.87232334	, Model:	0.328966902	},
    {Time:	16.34692001	, Strain:	0.791535971	, Model:	0.338203607	},
    {Time:	16.3471601	, Strain:	0.771134604	, Model:	0.345150491	},
    {Time:	16.34740996	, Strain:	0.804009107	, Model:	0.346185706	},
    {Time:	16.34765005	, Strain:	0.865102565	, Model:	0.337978733	},
    {Time:	16.34789991	, Strain:	0.918081708	, Model:	0.317873237	},
    {Time:	16.34814	, Strain:	0.924997624	, Model:	0.284199343	},
    {Time:	16.34838009	, Strain:	0.855985819	, Model:	0.236472763	},
    {Time:	16.34862995	, Strain:	0.696404058	, Model:	0.175453231	},
    {Time:	16.34887004	, Strain:	0.450027495	, Model:	0.103054283	},
    {Time:	16.3491199	, Strain:	0.138195181	, Model:	0.022117498	},
    {Time:	16.34935999	, Strain:	-0.204469088	, Model:	-0.063916519	},
    {Time:	16.34960008	, Strain:	-0.536872399	, Model:	-0.151393904	},
    {Time:	16.34984994	, Strain:	-0.819670743	, Model:	-0.236836546	},
    {Time:	16.35009003	, Strain:	-1.023363211	, Model:	-0.317282125	},
    {Time:	16.35033989	, Strain:	-1.134487435	, Model:	-0.390532151	},
    {Time:	16.35057998	, Strain:	-1.158364398	, Model:	-0.455280426	},
    {Time:	16.35083008	, Strain:	-1.117535089	, Model:	-0.51111341	},
    {Time:	16.35106993	, Strain:	-1.046018237	, Model:	-0.558393366	},
    {Time:	16.35131001	, Strain:	-0.980634751	, Model:	-0.598051838	},
    {Time:	16.35156012	, Strain:	-0.951617425	, Model:	-0.631332278	},
    {Time:	16.35179996	, Strain:	-0.975090789	, Model:	-0.659525111	},
    {Time:	16.35205007	, Strain:	-1.04942544	, Model:	-0.683735829	},
    {Time:	16.35228992	, Strain:	-1.15617131	, Model:	-0.704717899	},
    {Time:	16.35253	, Strain:	-1.264965543	, Model:	-0.722789222	},
    {Time:	16.3527801	, Strain:	-1.341013076	, Model:	-0.737836137	},
    {Time:	16.35301995	, Strain:	-1.353425113	, Model:	-0.749395065	},
    {Time:	16.35327005	, Strain:	-1.282634433	, Model:	-0.756790868	},
    {Time:	16.3535099	, Strain:	-1.125215277	, Model:	-0.759304391	},
    {Time:	16.35374999	, Strain:	-0.894851754	, Model:	-0.756339867	},
    {Time:	16.35400009	, Strain:	-0.619075208	, Model:	-0.747565611	},
    {Time:	16.35423994	, Strain:	-0.332622531	, Model:	-0.733007736	},
    {Time:	16.35449004	, Strain:	-0.069378002	, Model:	-0.713085181	},
    {Time:	16.35472989	, Strain:	0.14471138	, Model:	-0.688583566	},
    {Time:	16.35497999	, Strain:	0.295801636	, Model:	-0.660574107	},
    {Time:	16.35522008	, Strain:	0.382483439	, Model:	-0.630290813	},
    {Time:	16.35545993	, Strain:	0.412558736	, Model:	-0.598983911	},
    {Time:	16.35571003	, Strain:	0.397566315	, Model:	-0.567769529	},
    {Time:	16.35595012	, Strain:	0.346919764	, Model:	-0.537495248	},
    {Time:	16.35619998	, Strain:	0.26347294	, Model:	-0.508638502	},
    {Time:	16.35644007	, Strain:	0.141855459	, Model:	-0.481250445	},
    {Time:	16.35667992	, Strain:	-0.029703706	, Model:	-0.45495244	},
    {Time:	16.35693002	, Strain:	-0.264103469	, Model:	-0.428986175	},
    {Time:	16.3571701	, Strain:	-0.567691345	, Model:	-0.402312212	},
    {Time:	16.35741997	, Strain:	-0.932299689	, Model:	-0.373746032	},
    {Time:	16.35766006	, Strain:	-1.329723543	, Model:	-0.342115813	},
    {Time:	16.35790992	, Strain:	-1.711036711	, Model:	-0.306422946	},
    {Time:	16.35815001	, Strain:	-2.011976239	, Model:	-0.265985054	},
    {Time:	16.35839009	, Strain:	-2.164029951	, Model:	-0.22054249	},
    {Time:	16.35863996	, Strain:	-2.109136048	, Model:	-0.170312993	},
    {Time:	16.35888004	, Strain:	-1.814470863	, Model:	-0.115985224	},
    {Time:	16.35912991	, Strain:	-1.283381977	, Model:	-0.058649599	},
    {Time:	16.35936999	, Strain:	-0.559453932	, Model:	0.000326761	},
    {Time:	16.35961008	, Strain:	0.277528499	, Model:	0.059466143	},
    {Time:	16.35985994	, Strain:	1.123044525	, Model:	0.117366281	},
    {Time:	16.36010003	, Strain:	1.864415727	, Model:	0.172881426	},
    {Time:	16.36034989	, Strain:	2.399158927	, Model:	0.225273155	},
    {Time:	16.36058998	, Strain:	2.651676238	, Model:	0.274308675	},
    {Time:	16.36083007	, Strain:	2.585539057	, Model:	0.320290698	},
    {Time:	16.36107993	, Strain:	2.209557856	, Model:	0.364011738	},
    {Time:	16.36132002	, Strain:	1.576678153	, Model:	0.406635841	},
    {Time:	16.36156988	, Strain:	0.775703346	, Model:	0.449520916	},
    {Time:	16.36180997	, Strain:	-0.082849333	, Model:	0.4940035	},
    {Time:	16.36206007	, Strain:	-0.884143344	, Model:	0.541173815	},
    {Time:	16.36229992	, Strain:	-1.526437539	, Model:	0.591671162	},
    {Time:	16.36254001	, Strain:	-1.935605648	, Model:	0.645527901	},
    {Time:	16.36279011	, Strain:	-2.074648986	, Model:	0.702084389	},
    {Time:	16.36302996	, Strain:	-1.946952738	, Model:	0.759988266	},
    {Time:	16.36328006	, Strain:	-1.592939327	, Model:	0.817280568	},
    {Time:	16.36351991	, Strain:	-1.080779801	, Model:	0.871559811	},
    {Time:	16.36375999	, Strain:	-0.49281882	, Model:	0.920205184	},
    {Time:	16.3640101	, Strain:	0.089826007	, Model:	0.960632402	},
    {Time:	16.36424994	, Strain:	0.601600746	, Model:	0.990551852	},
    {Time:	16.36450005	, Strain:	1.003037763	, Model:	1.00819863	},
    {Time:	16.36473989	, Strain:	1.28543831	, Model:	1.012507885	},
    {Time:	16.36499	, Strain:	1.468803789	, Model:	1.003216	},
    {Time:	16.36523008	, Strain:	1.593443214	, Model:	0.980877462	},
    {Time:	16.36546993	, Strain:	1.707125828	, Model:	0.946797591	},
    {Time:	16.36572003	, Strain:	1.850870507	, Model:	0.902891355	},
    {Time:	16.36595988	, Strain:	2.046966182	, Model:	0.851486844	},
    {Time:	16.36620998	, Strain:	2.292264311	, Model:	0.79509783	},
    {Time:	16.36645007	, Strain:	2.558266921	, Model:	0.736192253	},
    {Time:	16.36668992	, Strain:	2.797610287	, Model:	0.676982503	},
    {Time:	16.36694002	, Strain:	2.954985306	, Model:	0.619259007	},
    {Time:	16.36718011	, Strain:	2.979777065	, Model:	0.564281854	},
    {Time:	16.36742997	, Strain:	2.837619012	, Model:	0.512736757	},
    {Time:	16.36767006	, Strain:	2.518398284	, Model:	0.464753022	},
    {Time:	16.36791992	, Strain:	2.039039792	, Model:	0.41997345	},
    {Time:	16.36816001	, Strain:	1.440644022	, Model:	0.377660402	},
    {Time:	16.3684001	, Strain:	0.780912291	, Model:	0.336819383	},
    {Time:	16.36864996	, Strain:	0.123807961	, Model:	0.296321751	},
    {Time:	16.36889005	, Strain:	-0.47110387	, Model:	0.255011408	},
    {Time:	16.36913991	, Strain:	-0.957227708	, Model:	0.211785921	},
    {Time:	16.36938	, Strain:	-1.30566541	, Model:	0.165649273	},
    {Time:	16.36962008	, Strain:	-1.505613836	, Model:	0.115740162	},
    {Time:	16.36986995	, Strain:	-1.56139336	, Model:	0.061344879	},
    {Time:	16.37011003	, Strain:	-1.488035776	, Model:	0.001906401	},
    {Time:	16.3703599	, Strain:	-1.30741938	, Model:	-0.062959268	},
    {Time:	16.37059999	, Strain:	-1.046128973	, Model:	-0.133432145	},
    {Time:	16.37084007	, Strain:	-0.735004903	, Model:	-0.209441306	},
    {Time:	16.37108994	, Strain:	-0.409310585	, Model:	-0.290607408	},
    {Time:	16.37133002	, Strain:	-0.107936311	, Model:	-0.376186527	},
    {Time:	16.37157989	, Strain:	0.12977787	, Model:	-0.465031178	},
    {Time:	16.37181997	, Strain:	0.270017873	, Model:	-0.555585212	},
    {Time:	16.37207007	, Strain:	0.291990618	, Model:	-0.645926116	},
    {Time:	16.37230992	, Strain:	0.194122668	, Model:	-0.73386158	},
    {Time:	16.37255001	, Strain:	-0.004056945	, Model:	-0.817077873	},
    {Time:	16.37280011	, Strain:	-0.265838898	, Model:	-0.89332738	},
    {Time:	16.37303996	, Strain:	-0.546144119	, Model:	-0.960633471	},
    {Time:	16.37329006	, Strain:	-0.802408635	, Model:	-1.01748469	},
    {Time:	16.37352991	, Strain:	-1.004166147	, Model:	-1.062988524	},
    {Time:	16.37377	, Strain:	-1.138658639	, Model:	-1.096958578	},
    {Time:	16.3740201	, Strain:	-1.211257516	, Model:	-1.119917436	},
    {Time:	16.37425995	, Strain:	-1.241123003	, Model:	-1.133009771	},
    {Time:	16.37451005	, Strain:	-1.253840831	, Model:	-1.137834179	},
    {Time:	16.3747499	, Strain:	-1.273356152	, Model:	-1.136215366	},
    {Time:	16.375	, Strain:	-1.315373429	, Model:	-1.129948262	},
    {Time:	16.37524009	, Strain:	-1.383765276	, Model:	-1.120550556	},
    {Time:	16.37547994	, Strain:	-1.470569377	, Model:	-1.109059111	},
    {Time:	16.37573004	, Strain:	-1.55899899	, Model:	-1.095898903	},
    {Time:	16.37596989	, Strain:	-1.628030073	, Model:	-1.080841803	},
    {Time:	16.37621999	, Strain:	-1.657041474	, Model:	-1.063058694	},
    {Time:	16.37646008	, Strain:	-1.629594991	, Model:	-1.041254438	},
    {Time:	16.37669992	, Strain:	-1.536173337	, Model:	-1.013863446	},
    {Time:	16.37695003	, Strain:	-1.376019386	, Model:	-0.979275828	},
    {Time:	16.37719011	, Strain:	-1.158069293	, Model:	-0.936061368	},
    {Time:	16.37743998	, Strain:	-0.9007183	, Model:	-0.883161013	},
    {Time:	16.37768006	, Strain:	-0.630181548	, Model:	-0.820022398	},
    {Time:	16.37791991	, Strain:	-0.377459918	, Model:	-0.74666576	},
    {Time:	16.37817001	, Strain:	-0.17409155	, Model:	-0.66367753	},
    {Time:	16.3784101	, Strain:	-0.047007613	, Model:	-0.572139162	},
    {Time:	16.37865996	, Strain:	-0.013236893	, Model:	-0.473506761	},
    {Time:	16.37890005	, Strain:	-0.075750323	, Model:	-0.369461887	},
    {Time:	16.37914991	, Strain:	-0.221719766	, Model:	-0.261755201	},
    {Time:	16.37939	, Strain:	-0.423668271	, Model:	-0.152062789	},
    {Time:	16.37963009	, Strain:	-0.643058169	, Model:	-0.041870771	},
    {Time:	16.37987995	, Strain:	-0.835486643	, Model:	0.06760172	},
    {Time:	16.38012004	, Strain:	-0.956795644	, Model:	0.175436944	},
    {Time:	16.3803699	, Strain:	-0.9695248	, Model:	0.281011504	},
    {Time:	16.38060999	, Strain:	-0.848949295	, Model:	0.383953379	},
    {Time:	16.38085008	, Strain:	-0.587661322	, Model:	0.484071733	},
    {Time:	16.38109994	, Strain:	-0.197667209	, Model:	0.581270206	},
    {Time:	16.38134003	, Strain:	0.290532888	, Model:	0.675455203	},
    {Time:	16.38158989	, Strain:	0.831646752	, Model:	0.766450616	},
    {Time:	16.38182998	, Strain:	1.371292296	, Model:	0.853929484	},
    {Time:	16.38208008	, Strain:	1.852898752	, Model:	0.937371352	},
    {Time:	16.38231993	, Strain:	2.22523129	, Model:	1.01605163	},
    {Time:	16.38256001	, Strain:	2.449925702	, Model:	1.089066025	},
    {Time:	16.38281012	, Strain:	2.507996138	, Model:	1.155389198	},
    {Time:	16.38304996	, Strain:	2.40382757	, Model:	1.213962453	},
    {Time:	16.38330007	, Strain:	2.165167203	, Model:	1.263800766	},
    {Time:	16.38353992	, Strain:	1.838354382	, Model:	1.304105571	},
    {Time:	16.38378	, Strain:	1.479368883	, Model:	1.334367073	},
    {Time:	16.3840301	, Strain:	1.142725685	, Model:	1.354439263	},
    {Time:	16.38426995	, Strain:	0.871108777	, Model:	1.364572851	},
    {Time:	16.38452005	, Strain:	0.688487949	, Model:	1.365396162	},
    {Time:	16.3847599	, Strain:	0.598375757	, Model:	1.35784126	},
    {Time:	16.38499999	, Strain:	0.587251931	, Model:	1.343021182	},
    {Time:	16.38525009	, Strain:	0.631534514	, Model:	1.322072825	},
    {Time:	16.38548994	, Strain:	0.705419189	, Model:	1.295987051	},
    {Time:	16.38574004	, Strain:	0.786924209	, Model:	1.26545152	},
    {Time:	16.38597989	, Strain:	0.860620978	, Model:	1.230731672	},
    {Time:	16.38622999	, Strain:	0.917270929	, Model:	1.191610828	},
    {Time:	16.38647008	, Strain:	0.9519799	, Model:	1.147402088	},
    {Time:	16.38670993	, Strain:	0.962766844	, Model:	1.097033894	},
    {Time:	16.38696003	, Strain:	0.950626266	, Model:	1.039199395	},
    {Time:	16.38720012	, Strain:	0.92085018	, Model:	0.972549265	},
    {Time:	16.38744998	, Strain:	0.884295163	, Model:	0.895900061	},
    {Time:	16.38769007	, Strain:	0.856984661	, Model:	0.808427027	},
    {Time:	16.38792992	, Strain:	0.85704479	, Model:	0.709812207	},
    {Time:	16.38818002	, Strain:	0.899138812	, Model:	0.600325463	},
    {Time:	16.3884201	, Strain:	0.987811069	, Model:	0.480826725	},
    {Time:	16.38866997	, Strain:	1.112036689	, Model:	0.352690484	},
    {Time:	16.38891006	, Strain:	1.243373148	, Model:	0.21766621	},
    {Time:	16.38915992	, Strain:	1.339193157	, Model:	0.077698603	},
    {Time:	16.38940001	, Strain:	1.350776783	, Model:	-0.065262397	},
    {Time:	16.38964009	, Strain:	1.234267062	, Model:	-0.209431201	},
    {Time:	16.38988996	, Strain:	0.961488293	, Model:	-0.353309835	},
    {Time:	16.39013004	, Strain:	0.527771188	, Model:	-0.495747997	},
    {Time:	16.39037991	, Strain:	-0.04507004	, Model:	-0.635934827	},
    {Time:	16.39061999	, Strain:	-0.711174118	, Model:	-0.77332941	},
    {Time:	16.39086008	, Strain:	-1.407863573	, Model:	-0.907547418	},
    {Time:	16.39110994	, Strain:	-2.066116259	, Model:	-1.038227925	},
    {Time:	16.39135003	, Strain:	-2.622083345	, Model:	-1.164906479	},
    {Time:	16.39159989	, Strain:	-3.027197046	, Model:	-1.286917581	},
    {Time:	16.39183998	, Strain:	-3.254698539	, Model:	-1.403342722	},
    {Time:	16.39208007	, Strain:	-3.301396338	, Model:	-1.513010411	},
    {Time:	16.39232993	, Strain:	-3.184952584	, Model:	-1.614544198	},
    {Time:	16.39257002	, Strain:	-2.938330361	, Model:	-1.706445571	},
    {Time:	16.39281988	, Strain:	-2.603476192	, Model:	-1.787192569	},
    {Time:	16.39305997	, Strain:	-2.225667441	, Model:	-1.855333118	},
    {Time:	16.39331007	, Strain:	-1.848818016	, Model:	-1.909554746	},
    {Time:	16.39354992	, Strain:	-1.511346467	, Model:	-1.948718785	},
    {Time:	16.39379001	, Strain:	-1.242430984	, Model:	-1.971855869	},
    {Time:	16.39404011	, Strain:	-1.059144422	, Model:	-1.97812866	},
    {Time:	16.39427996	, Strain:	-0.96523416	, Model:	-1.966775196	},
    {Time:	16.39453006	, Strain:	-0.951918236	, Model:	-1.937050661	},
    {Time:	16.39476991	, Strain:	-1.000467698	, Model:	-1.888185873	},
    {Time:	16.39500999	, Strain:	-1.086012818	, Model:	-1.819377509	},
    {Time:	16.3952601	, Strain:	-1.181978682	, Model:	-1.729818975	},
    {Time:	16.39549994	, Strain:	-1.264569772	, Model:	-1.618773108	},
    {Time:	16.39575005	, Strain:	-1.316571561	, Model:	-1.485680221	},
    {Time:	16.39598989	, Strain:	-1.329492568	, Model:	-1.330288615	},
    {Time:	16.39624	, Strain:	-1.303122307	, Model:	-1.152790547	},
    {Time:	16.39648008	, Strain:	-1.242261052	, Model:	-0.95394532	},
    {Time:	16.39671993	, Strain:	-1.151537487	, Model:	-0.735172518	},
    {Time:	16.39697003	, Strain:	-1.030291511	, Model:	-0.49860219	},
    {Time:	16.39720988	, Strain:	-0.869811603	, Model:	-0.247074191	},
    {Time:	16.39745998	, Strain:	-0.654412612	, Model:	0.015914997	},
    {Time:	16.39770007	, Strain:	-0.366177315	, Model:	0.286313699	},
    {Time:	16.39793992	, Strain:	0.008422658	, Model:	0.559655682	},
    {Time:	16.39819002	, Strain:	0.472414005	, Model:	0.83122776	},
    {Time:	16.39843011	, Strain:	1.01454169	, Model:	1.096250905	},
    {Time:	16.39867997	, Strain:	1.60860947	, Model:	1.350061765	},
    {Time:	16.39892006	, Strain:	2.215917233	, Model:	1.588283045	},
    {Time:	16.39916992	, Strain:	2.790264789	, Model:	1.806973219	},
    {Time:	16.39941001	, Strain:	3.284584243	, Model:	2.002748005	},
    {Time:	16.3996501	, Strain:	3.657948448	, Model:	2.17286756	},
    {Time:	16.39989996	, Strain:	3.881612655	, Model:	2.315284631	},
    {Time:	16.40014005	, Strain:	3.942976037	, Model:	2.428650072	},
    {Time:	16.40038991	, Strain:	3.846899313	, Model:	2.512273761	},
    {Time:	16.40063	, Strain:	3.614443725	, Model:	2.566041402	},
    {Time:	16.40087008	, Strain:	3.279454368	, Model:	2.590291046	},
    {Time:	16.40111995	, Strain:	2.883509672	, Model:	2.585657437	},
    {Time:	16.40136003	, Strain:	2.469929165	, Model:	2.552897008	},
    {Time:	16.4016099	, Strain:	2.077808988	, Model:	2.492710856	},
    {Time:	16.40184999	, Strain:	1.737108142	, Model:	2.405586603	},
    {Time:	16.40209007	, Strain:	1.465493577	, Model:	2.291681703	},
    {Time:	16.40233994	, Strain:	1.267182581	, Model:	2.150769774	},
    {Time:	16.40258002	, Strain:	1.133646443	, Model:	1.982267182	},
    {Time:	16.40282989	, Strain:	1.045851185	, Model:	1.785349375	},
    {Time:	16.40306997	, Strain:	0.977660203	, Model:	1.559155581	},
    {Time:	16.40332007	, Strain:	0.899966127	, Model:	1.303067862	},
    {Time:	16.40355992	, Strain:	0.784967988	, Model:	1.017037693	},
    {Time:	16.40380001	, Strain:	0.609906914	, Model:	0.701922716	},
    {Time:	16.40405011	, Strain:	0.359739387	, Model:	0.359790023	},
    {Time:	16.40428996	, Strain:	0.028609917	, Model:	-0.005857763	},
    {Time:	16.40454006	, Strain:	-0.379725203	, Model:	-0.389970748	},
    {Time:	16.40477991	, Strain:	-0.852362075	, Model:	-0.78597841	},
    {Time:	16.40502	, Strain:	-1.368578434	, Model:	-1.185961022	},
    {Time:	16.4052701	, Strain:	-1.90203549	, Model:	-1.580952521	},
    {Time:	16.40550995	, Strain:	-2.423707539	, Model:	-1.961343006	},
    {Time:	16.40576005	, Strain:	-2.90521051	, Model:	-2.317334905	},
    {Time:	16.4059999	, Strain:	-3.322092195	, Model:	-2.639399745	},
    {Time:	16.40625	, Strain:	-3.656506494	, Model:	-2.918683851	},
    {Time:	16.40649009	, Strain:	-3.898495605	, Model:	-3.147321394	},
    {Time:	16.40672994	, Strain:	-4.045212552	, Model:	-3.318630641	},
    {Time:	16.40698004	, Strain:	-4.098181567	, Model:	-3.427191096	},
    {Time:	16.40721989	, Strain:	-4.059771287	, Model:	-3.468821692	},
    {Time:	16.40746999	, Strain:	-3.930588911	, Model:	-3.44049881	},
    {Time:	16.40771008	, Strain:	-3.709012166	, Model:	-3.340263814	},
    {Time:	16.40794992	, Strain:	-3.392898505	, Model:	-3.167170258	},
    {Time:	16.40820003	, Strain:	-2.98247007	, Model:	-2.921310348	},
    {Time:	16.40844011	, Strain:	-2.483094566	, Model:	-2.603940116	},
    {Time:	16.40868998	, Strain:	-1.907069113	, Model:	-2.21769707	},
    {Time:	16.40893006	, Strain:	-1.273961406	, Model:	-1.766877924	},
    {Time:	16.40916991	, Strain:	-0.609241634	, Model:	-1.257723244	},
    {Time:	16.40942001	, Strain:	0.058915432	, Model:	-0.698645303	},
    {Time:	16.4096601	, Strain:	0.704310771	, Model:	-0.100338094	},
    {Time:	16.40990996	, Strain:	1.307737883	, Model:	0.524275265	},
    {Time:	16.41015005	, Strain:	1.860535804	, Model:	1.160275273	},
    {Time:	16.41039991	, Strain:	2.365006507	, Model:	1.791143468	},
    {Time:	16.41064	, Strain:	2.831087482	, Model:	2.399277186	},
    {Time:	16.41088009	, Strain:	3.270117403	, Model:	2.96655117	},
    {Time:	16.41112995	, Strain:	3.687618896	, Model:	3.4748476	},
    {Time:	16.41137004	, Strain:	4.077329006	, Model:	3.906487492	},
    {Time:	16.4116199	, Strain:	4.418233254	, Model:	4.24452761	},
    {Time:	16.41185999	, Strain:	4.675410871	, Model:	4.472933946	},
    {Time:	16.41210008	, Strain:	4.804530236	, Model:	4.576697115	},
    {Time:	16.41234994	, Strain:	4.759134203	, Model:	4.542004744	},
    {Time:	16.41259003	, Strain:	4.49936787	, Model:	4.356617762	},
    {Time:	16.41283989	, Strain:	4.000435887	, Model:	4.010598737	},
    {Time:	16.41307998	, Strain:	3.259058087	, Model:	3.497502571	},
    {Time:	16.41333008	, Strain:	2.296720029	, Model:	2.816060682	},
    {Time:	16.41356993	, Strain:	1.159254801	, Model:	1.972275528	},
    {Time:	16.41381001	, Strain:	-0.087255318	, Model:	0.981707932	},
    {Time:	16.41406012	, Strain:	-1.364008971	, Model:	-0.128392035	},
    {Time:	16.41429996	, Strain:	-2.589577277	, Model:	-1.317561573	},
    {Time:	16.41455007	, Strain:	-3.690584979	, Model:	-2.531703851	},
    {Time:	16.41478992	, Strain:	-4.610164215	, Model:	-3.70422691	},
    {Time:	16.41503	, Strain:	-5.311712684	, Model:	-4.759071231	},
    {Time:	16.4152801	, Strain:	-5.777124712	, Model:	-5.615734524	},
    {Time:	16.41551995	, Strain:	-6.000642136	, Model:	-6.196111836	},
    {Time:	16.41577005	, Strain:	-5.980788757	, Model:	-6.432644159	},
    {Time:	16.4160099	, Strain:	-5.713320328	, Model:	-6.276957817	},
    {Time:	16.41624999	, Strain:	-5.187999485	, Model:	-5.707934138	},
    {Time:	16.41650009	, Strain:	-4.391241442	, Model:	-4.738025633	},
    {Time:	16.41673994	, Strain:	-3.315049803	, Model:	-3.416671234	},
    {Time:	16.41699004	, Strain:	-1.97039956	, Model:	-1.829880367	},
    {Time:	16.41722989	, Strain:	-0.4011216	, Model:	-0.095449828	},
    {Time:	16.41747999	, Strain:	1.306679447	, Model:	1.646184779	},
    {Time:	16.41772008	, Strain:	3.024065209	, Model:	3.244842404	},
    {Time:	16.41795993	, Strain:	4.589846107	, Model:	4.556000991	},
    {Time:	16.41821003	, Strain:	5.831497858	, Model:	5.456971627	},
    {Time:	16.41845012	, Strain:	6.592461204	, Model:	5.861795491	},
    {Time:	16.41869998	, Strain:	6.759839846	, Model:	5.732788057	},
    {Time:	16.41894007	, Strain:	6.286396941	, Model:	5.086939594	},
    {Time:	16.41917992	, Strain:	5.202458487	, Model:	3.995964687	},
    {Time:	16.41943002	, Strain:	3.615900527	, Model:	2.579608849	},
    {Time:	16.4196701	, Strain:	1.70068705	, Model:	0.992754101	},
    {Time:	16.41991997	, Strain:	-0.324112673	, Model:	-0.592224701	},
    {Time:	16.42016006	, Strain:	-2.222036867	, Model:	-2.005662495	},
    {Time:	16.42040992	, Strain:	-3.770139371	, Model:	-3.10073443	},
    {Time:	16.42065001	, Strain:	-4.788865897	, Model:	-3.770821664	},
    {Time:	16.42089009	, Strain:	-5.166464203	, Model:	-3.961759806	},
    {Time:	16.42113996	, Strain:	-4.874129866	, Model:	-3.677313301	},
    {Time:	16.42138004	, Strain:	-3.969432028	, Model:	-2.977167827	},
    {Time:	16.42162991	, Strain:	-2.58728452	, Model:	-1.967788618	},
    {Time:	16.42186999	, Strain:	-0.919675522	, Model:	-0.787492547	},
    {Time:	16.42211008	, Strain:	0.812689505	, Model:	0.41212685	},
    {Time:	16.42235994	, Strain:	2.392287339	, Model:	1.485817167	},
    {Time:	16.42260003	, Strain:	3.635199377	, Model:	2.312648285	},
    {Time:	16.42284989	, Strain:	4.415306276	, Model:	2.809993266	},
    {Time:	16.42308998	, Strain:	4.67838749	, Model:	2.941792571	},
    {Time:	16.42333007	, Strain:	4.444010225	, Model:	2.720255122	},
    {Time:	16.42357993	, Strain:	3.795619415	, Model:	2.201104278	},
    {Time:	16.42382002	, Strain:	2.861652818	, Model:	1.473370876	},
    {Time:	16.42406988	, Strain:	1.791887061	, Model:	0.645440511	},
    {Time:	16.42430997	, Strain:	0.733392507	, Model:	-0.170515288	},
    {Time:	16.42456007	, Strain:	-0.190168974	, Model:	-0.873500245	},
    {Time:	16.42479992	, Strain:	-0.893169613	, Model:	-1.386051495	},
    {Time:	16.42504001	, Strain:	-1.334972659	, Model:	-1.662496559	},
    {Time:	16.42529011	, Strain:	-1.518933552	, Model:	-1.692287225	},
    {Time:	16.42552996	, Strain:	-1.484555997	, Model:	-1.498333372	},
    {Time:	16.42578006	, Strain:	-1.2950668	, Model:	-1.130961062	},
    {Time:	16.42601991	, Strain:	-1.023261162	, Model:	-0.658679031	},
    {Time:	16.42625999	, Strain:	-0.738421459	, Model:	-0.157286552	},
    {Time:	16.4265101	, Strain:	-0.49649592	, Model:	0.30103994	},
    {Time:	16.42674994	, Strain:	-0.334674734	, Model:	0.657179069	},
    {Time:	16.42700005	, Strain:	-0.270326926	, Model:	0.871848689	},
    {Time:	16.42723989	, Strain:	-0.303344432	, Model:	0.929046202	},
    {Time:	16.42749	, Strain:	-0.420464493	, Model:	0.835977286	},
    {Time:	16.42773008	, Strain:	-0.60011128	, Model:	0.619810084	},
    {Time:	16.42796993	, Strain:	-0.816676059	, Model:	0.322003643	},
    {Time:	16.42822003	, Strain:	-1.043753857	, Model:	-0.008772177	},
    {Time:	16.42845988	, Strain:	-1.256351483	, Model:	-0.324008341	},
    {Time:	16.42870998	, Strain:	-1.432301782	, Model:	-0.581970178	},
    {Time:	16.42895007	, Strain:	-1.553095362	, Model:	-0.752712565	},
    {Time:	16.42918992	, Strain:	-1.604214718	, Model:	-0.820964145	},
    {Time:	16.42944002	, Strain:	-1.575064686	, Model:	-0.786700546	},
    {Time:	16.42968011	, Strain:	-1.458860207	, Model:	-0.6635689	},
    {Time:	16.42992997	, Strain:	-1.25306418	, Model:	-0.475610142	},
    {Time:	16.43017006	, Strain:	-0.96072587	, Model:	-0.252916662	},
    {Time:	16.43041992	, Strain:	-0.592394308	, Model:	-0.02694322	},
    {Time:	16.43066001	, Strain:	-0.167706311	, Model:	0.173841204	},
    {Time:	16.4309001	, Strain:	0.284326073	, Model:	0.327397661	},
    {Time:	16.43114996	, Strain:	0.726963502	, Model:	0.420285432	},
    {Time:	16.43139005	, Strain:	1.119456596	, Model:	0.448404384	},
    {Time:	16.43163991	, Strain:	1.422400283	, Model:	0.416379882	},
    {Time:	16.43188	, Strain:	1.603738807	, Model:	0.335841785	},
    {Time:	16.43212008	, Strain:	1.644115761	, Model:	0.222974484	},
    {Time:	16.43236995	, Strain:	1.540356895	, Model:	0.095771314	},
    {Time:	16.43261003	, Strain:	1.306353437	, Model:	-0.028586207	},
    {Time:	16.4328599	, Strain:	0.971267439	, Model:	-0.135875707	},
    {Time:	16.43309999	, Strain:	0.575461313	, Model:	-0.216272266	},
    {Time:	16.43334007	, Strain:	0.164717488	, Model:	-0.264974714	},
    {Time:	16.43358994	, Strain:	-0.2165311	, Model:	-0.282046849	},
    {Time:	16.43383002	, Strain:	-0.531885734	, Model:	-0.271609238	},
    {Time:	16.43407989	, Strain:	-0.758316768	, Model:	-0.240591366	},
    {Time:	16.43431997	, Strain:	-0.889170876	, Model:	-0.197287303	},
    {Time:	16.43457007	, Strain:	-0.934361765	, Model:	-0.149951328	},
    {Time:	16.43480992	, Strain:	-0.917615369	, Model:	-0.105629673	},
    {Time:	16.43505001	, Strain:	-0.871030925	, Model:	-0.069361324	},
    {Time:	16.43530011	, Strain:	-0.827852729	, Model:	-0.043807184	},
    {Time:	16.43553996	, Strain:	-0.814957412	, Model:	-0.029295049	},
    {Time:	16.43579006	, Strain:	-0.846709169	, Model:	-0.024208348	},
    {Time:	16.43602991	, Strain:	-0.921464154	, Model:	-0.025606242	},
    {Time:	16.43627	, Strain:	-1.021406034	, Model:	-0.029945029	},
    {Time:	16.4365201	, Strain:	-1.115788403	, Model:	-0.033775115	},
    {Time:	16.43675995	, Strain:	-1.167043988	, Model:	-0.034310398	},
    {Time:	16.43701005	, Strain:	-1.13861041	, Model:	-0.029801688	},
    {Time:	16.4372499	, Strain:	-1.002918869	, Model:	-0.019685768	},
    {Time:	16.4375	, Strain:	-0.747977947	, Model:	-0.004520008	},
    {Time:	16.43774009	, Strain:	-0.381308427	, Model:	0.014256336	},
    {Time:	16.43797994	, Strain:	0.069562255	, Model:	0.034672617	},
    {Time:	16.43823004	, Strain:	0.560380394	, Model:	0.054619221	},
    {Time:	16.43846989	, Strain:	1.036981263	, Model:	0.072215294	},
    {Time:	16.43871999	, Strain:	1.444583634	, Model:	0.086097647	},
    {Time:	16.43896008	, Strain:	1.7376931	, Model:	0.095595389	},
    {Time:	16.43919992	, Strain:	1.888385815	, Model:	0.100776099	},
    {Time:	16.43945003	, Strain:	1.891039547	, Model:	0.102370007	},
    {Time:	16.43969011	, Strain:	1.762402725	, Model:	0.101595766	},
    {Time:	16.43993998	, Strain:	1.537035531	, Model:	0.099923196	},
    {Time:	16.44018006	, Strain:	1.259361343	, Model:	0.098813866	},
    {Time:	16.44041991	, Strain:	0.97442899	, Model:	0.09947946	},
    {Time:	16.44067001	, Strain:	0.719615217	, Model:	0.102691566	},
    {Time:	16.4409101	, Strain:	0.518896472	, Model:	0.108666249	},
    {Time:	16.44115996	, Strain:	0.38044429	, Model:	0.117034481	},
    {Time:	16.44140005	, Strain:	0.29757703	, Model:	0.126897098	},
    {Time:	16.44164991	, Strain:	0.252585299	, Model:	0.13695205	},
    {Time:	16.44189	, Strain:	0.222509087	, Model:	0.14567356	},
    {Time:	16.44213009	, Strain:	0.185554409	, Model:	0.151517813	},
    {Time:	16.44237995	, Strain:	0.126632748	, Model:	0.153128303	},
    {Time:	16.44262004	, Strain:	0.040709619	, Model:	0.149515467	},
    {Time:	16.4428699	, Strain:	-0.066675822	, Model:	0.14018941	},
    {Time:	16.44310999	, Strain:	-0.181518975	, Model:	0.125230734	},
    {Time:	16.44335008	, Strain:	-0.285323798	, Model:	0.105292024	},
    {Time:	16.44359994	, Strain:	-0.359989715	, Model:	0.081530828	},
    {Time:	16.44384003	, Strain:	-0.392570313	, Model:	0.055483031	},
    {Time:	16.44408989	, Strain:	-0.378743323	, Model:	0.028892709	},
    {Time:	16.44432998	, Strain:	-0.323928196	, Model:	0.003519811	},
    {Time:	16.44458008	, Strain:	-0.241578787	, Model:	-0.019050175	},
    {Time:	16.44481993	, Strain:	-0.149150322	, Model:	-0.037570677	},
    {Time:	16.44506001	, Strain:	-0.063124334	, Model:	-0.051252096	},
    {Time:	16.44531012	, Strain:	0.00518292	, Model:	-0.059819181	},
    {Time:	16.44554996	, Strain:	0.051649701	, Model:	-0.063501749	},
    {Time:	16.44580007	, Strain:	0.078684211	, Model:	-0.062962186	},
    {Time:	16.44603992	, Strain:	0.092336328	, Model:	-0.059172182	},
    {Time:	16.44628	, Strain:	0.098468914	, Model:	-0.053258547	},
    {Time:	16.4465301	, Strain:	0.09962839	, Model:	-0.046342286	},
    {Time:	16.44676995	, Strain:	0.093990136	, Model:	-0.039395706	},
    {Time:	16.44702005	, Strain:	0.076863343	, Model:	-0.033138735	},
    {Time:	16.4472599	, Strain:	0.044001452	, Model:	-0.027988495	},
    {Time:	16.44749999	, Strain:	-0.005006465	, Model:	-0.024066471	},
    {Time:	16.44775009	, Strain:	-0.065057116	, Model:	-0.021257227	},
    {Time:	16.44798994	, Strain:	-0.126426494	, Model:	-0.019303397	},
    {Time:	16.44824004	, Strain:	-0.177781874	, Model:	-0.017915401	},
    {Time:	16.44847989	, Strain:	-0.209987772	, Model:	-0.016872318	},
    {Time:	16.44872999	, Strain:	-0.219231158	, Model:	-0.016092927	},
    {Time:	16.44897008	, Strain:	-0.208304912	, Model:	-0.015662629	},
    {Time:	16.44920993	, Strain:	-0.185503024	, Model:	-0.015811463	},
    {Time:	16.44946003	, Strain:	-0.161506644	, Model:	-0.01684878	},
    {Time:	16.44970012	, Strain:	-0.145540215	, Model:	-0.019069385	},
    {Time:	16.44994998	, Strain:	-0.142363119	, Model:	-0.022652176	},
    {Time:	16.45019007	, Strain:	-0.151181968	, Model:	-0.027574377	}
       
  ];

  // create table
  
  const container = document.getElementById("table-div");
  const hot = new Handsontable(
    container,
    Object.assign({}, tableCommonOptions, {
      data: tableData,
      colHeaders: ["Time", "Strain", "Model"], // need to change to filter1, filter2
      columns: [
        {
          data: "Time",
          type: "numeric",
          numericFormat: { pattern: { mantissa: 2 } },
        },
        {
          data: "Strain",
          type: "numeric",
          numericFormat: { pattern: { mantissa: 2 } },
        },
        {
          data: "Model",
          type: "numeric",
          numericFormat: { pattern: { mantissa: 2 } },
        },
      ],
      hiddenColumns: { columns: [2] },
    })
  );
  //now we need to hide the model column
  // create chart
  const ctx = (
    document.getElementById("myChart") as HTMLCanvasElement
  ).getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Model",
          data: null, // will be generated later
          borderColor: colors["blue"],
          backgroundColor: colors["white-0"],
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 0,
          fill: false,
          immutableLabel: true,
        },
        {
          label: 'Data',
          data: [],
          borderColor: colors['red'],
          backgroundColor: colors['red'],
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          hidden: false,
          immutableLabel: false,
        },
      ],
    },
    options: {
      hover: {
        mode: "nearest",
      },
      scales: {
        x: {
          //label: 'B-V',
          type: "linear",
          position: "bottom",
        },
        y: {
          //label: 'V',
          reverse: false,
          suggestedMin: 0,
        },
      },
    },
  });
  console.log(myChart);
  const update = function () {
    //console.log(tableData);
    updateTableHeight(hot);
    updateWave(hot, myChart, gravityForm, 1);  
    
  };
console.log(myChart);
  // link chart to table
  hot.updateSettings({
    afterChange: update,
    afterRemoveRow: update,
    afterCreateRow: update,
  });
  const fps = 100;
  const frameTime = Math.floor(1000 / fps);
  gravityForm.oninput = throttle(
    function () {updateWave(hot,myChart,gravityForm,1)},
    frameTime);
  // link chart to model form (slider + text)

  filterForm.oninput = function () {
    //console.log(tableData);
//leaving this stuff here just in case we need drop down dependencies later
    const reveal: string[] = [
    ];

    const columns: string[] = hot.getColHeader() as string[];
    const hidden: number[] = [];
    for (const col in columns) { //cut off " Mag"
      if (!reveal.includes(columns[col])) {
        //if the column isn't selected in the drop down, hide it
        hidden.push(parseFloat(col));
      }
    }
    hot.updateSettings({
      hiddenColumns: {
        columns: hidden,
        // copyPasteEnabled: false,
        indicators: false,
      },
    });

    update();
    updateLabels(
      myChart,
      document.getElementById("chart-info-form") as ChartInfoForm
    );
    myChart.update("none");
  };
  update();
  myChart.options.plugins.title.text = "Title";
  myChart.options.scales["x"].title.text = "x";
  myChart.options.scales["y"].title.text = "y";
  updateLabels(
    myChart,
    document.getElementById("chart-info-form") as ChartInfoForm,
    false,
    false,
    false,
    false
  );
  return [hot, myChart];
}

/**
 * This function handles the uploaded file to the variable chart. Specifically, it parse the file
 * and load related information into the table.
 * DATA FLOW: file -> table
 * @param {Event} evt The uploadig event
 * @param {Handsontable} table The table to be updated
 * @param {Chartjs} myChart
 */

//remember later to change the file type to .hdf5

export function gravityFileUpload(
  evt: Event,
  table: Handsontable,
  myChart: Chart<"line">
) 
{
  const file = (evt.target as HTMLInputElement).files[0];

  if (file === undefined) {
    return;
  }

  // File type validation
  if (
    !file.type.match("(text/csv|application/vnd.ms-excel)") &&
    !file.name.match(".*.csv")
  ) {
    alert("Please upload a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const gravityForm = document.getElementById("gravity-form") as GravityForm;
    // console.log(gravityForm.elements['d'].value);
    gravityForm["dist"].value = Math.log(300).toString();
    // console.log(gravityForm.elements['d'].value);
    gravityForm["mass"].value = Math.log(25).toString();
    gravityForm["ratio"].value = "1";
    gravityForm["merge"].value = "50";
    gravityForm["dist_num"].value = "300";
    gravityForm["mass_num"].value = "25";
    gravityForm["ratio_num"].value = "1";
    gravityForm["merge_num"].value = "50";
    myChart.options.plugins.title.text = "Title";
    myChart.data.datasets[1].label = "Data";
    myChart.options.scales["x"].title.text = "x";
    myChart.options.scales["y"].title.text = "y";
    updateLabels(
      myChart,
      document.getElementById("chart-info-form") as ChartInfoForm,
      false,
      false,
      false,
      false
    );
  }}
function updateWave(
  table: Handsontable,
  myChart: Chart,
  gravityForm: GravityForm,
  dataSetIndex: 1) 
{
  let inc = parseFloat(gravityForm["inc_num"].value);
  let dist = parseFloat(gravityForm["dist_num"].value);
  let merge = parseFloat(gravityForm["merge_num"].value);
    
  let start = 0;
  let chart = myChart.data.datasets[dataSetIndex].data;
  let tableData = table.getData();
    
    for (let i = 0; i < tableData.length; i++) {
      if (
      tableData[i][0] === null ||
      tableData[i][1] === null ||
      tableData[i][2] === null 
      ) {
      continue;
        }
        //red-blue,lum
    
    let x = (tableData[i][0]);
    let y = (tableData[i][1])
    let x2 = (tableData[i][0]);
    let y2 = (tableData[i][2])
    chart[start++] = {
      x: x,
      y: y,
        };
//console.log(x);/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//console.log(y);/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//broke chart
  //while (chart.length !== start) {
    //chart.pop();
  }

  myChart.update()
}

 // }
   
/**
 *  This function takes a form to obtain the 4 parameters (a, p, phase, tilt) that determines the
 *  relationship between a moon's angular distance and Julian date, and generates a dataset that
 *  spans over the range determined by the max and min value present in the table.
 *  @param table:   A table used to determine the max and min value for the range
 *  @param form:    A form containing the 4 parameters (amplitude, period, phase, tilt)
 *  @param chart:   The Chartjs object to be updated.
 */
//insert graviational wave function here

/**
 *  This function generates the data used for functions "updateHRModel" and "gravityGenerator."
 *
 *  @param d:            Distance to the Gravity
 *  @param r:            % of the range
 *  @param age:          Age of the Gravity
 *  @param reddening:    The reddening of the observation
 *  @param metallicity:  Metallicity of the gravity
 *  @param start:        The starting point of the data points
 *  @param end:          The end point of the data points
 *  @param steps:        Steps generated to be returned in the array. Default is 500
 *  @returns {Array}
 */

 


    //finding the maximum and minimum of y value for chart scaling
    
  

