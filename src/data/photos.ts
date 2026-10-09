// Photo filenames from TheMealDB (https://www.themealdb.com) — free dish photos, keyed by meal id.
// Generated from the public API; only main-course categories are included.
import { LOCAL_PHOTOS } from './photoCredits';

const BASE = 'https://www.themealdb.com/images/media/meals/';

const PHOTOS: Record<string, string> = {
  '52845': 'ypuxtw1511297463.jpg', // Turkey Meatloaf
  '52815': 'vwwspt1487394060.jpg', // French Lentils With Garlic and Thyme
  '52764': 'wuvryu1468232995.jpg', // Garides Saganaki
  '52765': 'qtuwxu1468233098.jpg', // Chicken Enchilada Casserole
  '52769': 'sxysrt1468240488.jpg', // Kapsalon
  '52770': 'sutysw1468247559.jpg', // Spaghetti Bolognese
  '52771': 'ustsqw1468250014.jpg', // Spicy Arrabiata Penne
  '52772': 'wvpsxx1468256321.jpg', // Teriyaki Chicken Casserole
  '52773': 'xxyupu1468262513.jpg', // Honey Teriyaki Salmon
  '52774': 'uuuspp1468263334.jpg', // Pad See Ew
  '52775': 'rvxxuy1468312893.jpg', // Vegan Lasagna
  '52777': 'wvqpwt1468339226.jpg', // Mediterranean Pasta Salad
  '52780': 'qwrtut1468418027.jpg', // Potato Gratin with Chicken
  '52781': 'sxxpst1468569714.jpg', // Irish stew
  '52782': 'qtwtss1468572261.jpg', // Lamb tomato and sweet spices
  '52783': 'qtqvys1468573168.jpg', // Rigatoni with fennel sausage sauce
  '52784': 'uwxqwy1483389553.jpg', // Smoky Lentil Chili with Squash
  '52785': 'wuxrtu1483564410.jpg', // Dal fry
  '52794': 'qxutws1486978099.jpg', // Vegan Chocolate Cake
  '52795': 'wyxwsp1486979827.jpg', // Chicken Handi
  '52796': 'syqypv1486981727.jpg', // Chicken Alfredo Primavera
  '52797': 'urtwux1486983078.jpg', // Spicy North African Potato Salad
  '52802': 'ysxwuq1487323065.jpg', // Fish pie
  '52803': 'vvpprx1487325699.jpg', // Beef Wellington
  '52805': 'xrttsx1487339558.jpg', // Lamb Biryani
  '52806': 'qptpvt1487339892.jpg', // Tandoori chicken
  '52807': 'urtpqw1487341253.jpg', // Baingan Bharta
  '52808': 'vvstvq1487342592.jpg', // Lamb Rogan josh
  '52809': 'uwxusv1487344500.jpg', // Recheado Masala Fish
  '52811': 'xrrwpx1487347049.jpg', // Ribollita
  '52812': 'ursuup1487348423.jpg', // Beef Brisket Pot Roast
  '52813': '40r49m1763197022.jpg', // Kentucky Fried Chicken
  '52814': 'sstssx1487349585.jpg', // Thai Green Curry
  '52816': 'ysqrus1487425681.jpg', // Roasted Eggplant With Tahini, Pine Nuts, and Lentils
  '52817': 'yqwtvu1487426027.jpg', // Stovetop Eggplant With Harissa, Chickpeas, and Cumin Yogurt
  '52818': 'qrqywr1503066605.jpg', // Chicken Fajita Mac and Cheese
  '52819': 'uvuyxu1503067369.jpg', // Cajun spiced fish tacos
  '52820': 'vwrpps1503068729.jpg', // Katsu Chicken curry
  '52821': 'rvypwy1503069308.jpg', // Laksa King Prawn Noodles
  '52822': 'ytuvwr1503070420.jpg', // Toad In The Hole
  '52823': 'xxrxux1503070723.jpg', // Salmon Prawn Risotto
  '52824': 'ssrrrs1503664277.jpg', // Beef Sunday Roast
  '52826': 'uuqvwu1504629254.jpg', // Braised Beef Chilli
  '52827': 'tvttqv1504640475.jpg', // Massaman Beef curry
  '52828': 'qqwypw1504642429.jpg', // Vietnamese Grilled Pork (bun-thit-nuong)
  '52829': 'xutquv1505330523.jpg', // Grilled Mac and Cheese Sandwich
  '52830': 'ypxvwv1505333929.jpg', // Crock Pot Chicken Baked Tacos
  '52831': 'tyywsw1505930373.jpg', // Chicken Karaage
  '52832': 'qstyvs1505931190.jpg', // Coq au vin
  '52834': 'svprys1511176755.jpg', // Beef stroganoff
  '52835': 'uquqtu1511178042.jpg', // Fettucine alfredo
  '52836': 'wqqvyq1511179730.jpg', // Seafood fideuà
  '52837': 'vvtvtr1511180578.jpg', // Pilchard puttanesca
  '52838': 'qvrwpt1511181864.jpg', // Venetian Duck Ragu
  '52839': 'usywpp1511189717.jpg', // Chilli prawn linguine
  '52843': 'yuwtuu1511295751.jpg', // Lamb Tagine
  '52844': 'wtsvxx1511296896.jpg', // Lasagne
  '52846': 'uuuspp1511297945.jpg', // Chicken & mushroom Hotpot
  '52847': 'wxuvuv1511299147.jpg', // Pork Cassoulet
  '52849': 'wspuvp1511303478.jpg', // Spinach & Ricotta Cannelloni
  '52850': 'qxytrx1511304021.jpg', // Chicken Couscous
  '52851': 'yxsurp1511304301.jpg', // Nutty Chicken Curry
  '52852': 'yypwwq1511304979.jpg', // Tuna Nicoise
  '52863': 'vptwyt1511450962.jpg', // Vegetarian Casserole
  '52864': 'ssyqwr1511451678.jpg', // Mushroom & Chestnut Rotolo
  '52865': 'xxpqsy1511452222.jpg', // Matar Paneer
  '52866': 'wxswxy1511452625.jpg', // Squash linguine
  '52867': 'wqurxy1511453156.jpg', // Vegetarian Chilli
  '52868': 'sywrsu1511463066.jpg', // Kidney Bean Curry
  '52869': 'vpxyqt1511464175.jpg', // Tahini Lentils
  '52870': 'tvtxpq1511464705.jpg', // Chickpea Fajitas
  '52871': 'wrustq1511475474.jpg', // Yaki Udon
  '52872': 'quuxsx1511476154.jpg', // Spanish Tortilla
  '52873': 'uyqrrv1511553350.jpg', // Beef Dumpling Stew
  '52874': 'sytuqu1511553755.jpg', // Beef and Mustard Pie
  '52875': 'xrrtss1511555269.jpg', // Chicken Ham and Leek Pie
  '52876': 'xwutvy1511555540.jpg', // Minced Beef Pie
  '52877': 'sxrpws1511555907.jpg', // Lamb and Potato pie
  '52878': 'wrssvt1511556563.jpg', // Beef and Oyster pie
  '52879': 'uwvxpv1511557015.jpg', // Chicken Parmentier
  '52880': 'vssrtx1511557680.jpg', // McSinghs Scotch pie
  '52881': 'qysyss1511558054.jpg', // Steak and Kidney Pie
  '52882': 'spswqs1511558697.jpg', // Three Fish Pie
  '52884': 'uttrxw1511637813.jpg', // Lancashire hotpot
  '52887': 'utxqpt1511639216.jpg', // Kedgeree
  '52904': 'vtqxtu1511784197.jpg', // Beef Bourguignon
  '52906': 'wssvvs1511785879.jpg', // Flamiche
  '52908': 'wrpwuu1511786491.jpg', // Ratatouille
  '52911': 'rqtxvr1511792990.jpg', // Summer Pistou
  '52918': 'vptqpw1511798500.jpg', // Fish Stew with Rouille
  '52920': 'qpxvuq1511798906.jpg', // Chicken Marengo
  '52921': 'qwtrtp1511799242.jpg', // Provençal Omelette Cake
  '52926': 'ytpstt1511814614.jpg', // Tourtiere
  '52927': 'uttupv1511815050.jpg', // Montreal Smoked Meat
  '52930': 'yyrrxr1511816289.jpg', // Pate Chinois
  '52933': 'ruwpww1511817242.jpg', // Rappie Pie
  '52934': 'wruvqv1511880994.jpg', // Chicken Basquaise
  '52935': 'vussxq1511882648.jpg', // Steak Diane
  '52936': 'vytypy1511883765.jpg', // Saltfish and Ackee
  '52937': 'tytyxu1515363282.jpg', // Jerk chicken with rice & peas
  '52938': 'wsqqsw1515364068.jpg', // Jamaican Beef Patties
  '52940': 'sypxpx1515365095.jpg', // Brown Stew Chicken
  '52941': 'sqpqtp1515365614.jpg', // Red Peas Soup
  '52942': '1520081754.jpg', // Roast fennel and aubergine paella
  '52943': '1520083578.jpg', // Oxtail with broad beans
  '52944': '1520084413.jpg', // Escovitch Fish
  '52945': '1525872624.jpg', // Kung Pao Chicken
  '52946': '1525873040.jpg', // Kung Po Prawns
  '52947': '1525874812.jpg', // Ma Po Tofu
  '52948': '1525876468.jpg', // Wontons
  '52949': '1529442316.jpg', // Sweet and Sour Pork
  '52950': '1529443236.jpg', // Szechuan Beef
  '52951': '1529444113.jpg', // General Tsos Chicken
  '52952': '1529444830.jpg', // Beef Lo Mein
  '52953': '1529445434.jpg', // Shrimp Chow Fun
  '52954': '1529445893.jpg', // Hot and Sour Soup
  '52955': '1529446137.jpg', // Egg Drop Soup
  '52956': '1529446352.jpg', // Chicken Congee
  '52959': '1548772327.jpg', // Baked salmon with fennel & tomatoes
  '52960': '1549542994.jpg', // Salmon Avocado Salad
  '52963': 'g373701551450225.jpg', // Shakshuka
  '52968': 'cuio7s1555492979.jpg', // Mbuzi Choma (Roasted Goat)
  '52971': '1bsv1q1560459826.jpg', // Kafteji
  '52972': 't8mn9g1560460231.jpg', // Tunisian Lamb Soup
  '52973': 'x2fw9e1560460636.jpg', // Leblebi Soup
  '52974': '8x09hy1560460923.jpg', // Keleya Zaara
  '52975': '2dsltq1560461468.jpg', // Tuna and Egg Briks
  '52979': 'lhqev81565090111.jpg', // Bitterballen (Dutch meatballs)
  '52980': 'hyarod1565090529.jpg', // Stamppot
  '52982': 'llcbn01574260722.jpg', // Spaghetti alla Carbonara
  '52987': 'xr0n4r1576788363.jpg', // Lasagna Sandwiches
  '52992': 'o2wb6p1581005243.jpg', // Soy-Glazed Meatloaves with Wasabi Mashed Potatoes & Roasted Carrots
  '52993': 'kvbotn1581012881.jpg', // Honey Balsamic Chicken with Crispy Broccoli & Potatoes
  '52994': 'h3ijwo1581013377.jpg', // Skillet Apple Pork Chops with Roasted Sweet Potatoes & Zucchini
  '52995': 'atd5sh1583188467.jpg', // BBQ Pork Sloppy Joes
  '52996': 'b5ft861583188991.jpg', // French Onion Chicken with Roasted Carrots & Mashed Potatoes
  '52997': 'z0ageb1583189517.jpg', // Beef Banh Mi Bowls with Sriracha Mayo, Carrot & Pickled Cucumber
  '52998': 'xb97a81583266727.jpg', // Corned Beef and Cabbage
  '52999': 'st1ifa1583267248.jpg', // Crispy Sausages and Greens
  '53000': 'w8umt11583268117.jpg', // Vegetable Shepherds Pie
  '53006': 'ctg8jd1585563097.jpg', // Moussaka
  '53008': 'u55lbp1585564013.jpg', // Stuffed Lamb Tomatoes
  '53009': 'rjhf741585564676.jpg', // Lamb and Lemon Souvlaki
  '53010': 'k420tj1585565244.jpg', // Lamb Tzatziki Burgers
  '53011': 'k29viq1585565980.jpg', // Chicken Quinoa Greek Salad
  '53012': 'b79r6f1585566277.jpg', // Gigantes Plaki
  '53013': 'urzj1d1587670726.jpg', // Big Mac
  '53016': 'sbx7n71587673021.jpg', // Chick-Fil-A Sandwich
  '53017': 'c9a3l31593261890.jpg', // Paszteciki (Polish Pasties)
  '53018': 'md8w601593348504.jpg', // Bigos (Hunters Stew)
  '53020': 'lx1kkj1593349302.jpg', // Rosol (Polish Chicken Soup)
  '53021': 'q8sp3j1593349686.jpg', // Golabki (cabbage roll)
  '53023': '7ttta31593350374.jpg', // Sledz w Oleju (Polish Herrings)
  '53025': 'lvn2d51598732465.jpg', // Ful Medames
  '53026': 'n3xxd91598732796.jpg', // Tamiya
  '53027': '4er7mj1598733193.jpg', // Koshari
  '53028': 'kcv6hj1598733479.jpg', // Shawarma
  '53029': 'x372ug1598733932.jpg', // Mulukhiyah
  '53031': 'rlwcc51598734603.jpg', // Egyptian Fatteh
  '53032': 'lwsnkl1604181187.jpg', // Tonkatsu pork
  '53034': 'd8f6qx1604182128.jpg', // Japanese Katsudon
  '53035': 'n41ny81608588066.jpg', // Ham hock colcannon
  '53036': 'naqyel1608588563.jpg', // Boxty Breakfast
  '53037': '7vpsfp1608588991.jpg', // Coddled pork with cider
  '53039': 'hglsbl1614346998.jpg', // Piri-piri chicken and slaw
  '53040': '1c5oso1614347493.jpg', // Spring onion and prawn empanadas
  '53041': 'lpd4wy1614347943.jpg', // Grilled Portuguese sardines
  '53042': 'ewcikl1614348364.jpg', // Portuguese prego with green piri-piri
  '53043': 'a15wsa1614349126.jpg', // Fish fofos
  '53044': 'cybyue1614349443.jpg', // Portuguese barbecued pork (Febras assadas)
  '53045': 'do7zps1614349775.jpg', // Portuguese fish stew (Caldeirada de peixe)
  '53047': 'jcr46d1614763831.jpg', // Moroccan Carrot Soup
  '53048': 'xquakq1619787532.jpg', // Mee goreng mamak
  '53050': '020z181619788503.jpg', // Ayam Percik
  '53051': 'wai9bw1619788844.jpg', // Nasi lemak
  '53052': 'hx335q1619789561.jpg', // Roti john
  '53053': 'bc8v651619789840.jpg', // Beef Rendang
  '53055': 'vc08jn1628769553.jpg', // Cevapi Sausages
  '53056': 'pn59o51628769837.jpg', // Croatian lamb peka
  '53057': 'n1hcou1628770088.jpg', // Traditional Croatian Goulash
  '53058': 'tnwy8m1628770384.jpg', // Croatian Bean Stew
  '53063': 'n7qnkb1630444129.jpg', // Chivito uruguayo
  '53064': '0jv5gx1661040802.jpg', // Fettuccine Alfredo
  '53065': 'g046bb1663960946.jpg', // Sushi
  '53067': 'b66myb1683207208.jpg', // Stuffed Bell Peppers with Quinoa and Black Beans
  '53068': 'cgl60b1683206581.jpg', // Beef Mechado
  '53069': '4pqimk1683207418.jpg', // Bistek
  '53070': '41cxjh1683207682.jpg', // Beef Caldereta
  '53071': 'pkopc31683207947.jpg', // Beef Asado
  '53072': 'c7lzrl1683208757.jpg', // Crispy Eggplant
  '53073': 'y7h0lq1683208991.jpg', // Eggplant Adobo
  '53074': 'bopa2i1683209167.jpg', // Grilled eggplant with coconut milk
  '53075': 'va668f1683209318.jpg', // Tortang Talong
  '53077': '60oc3k1699009846.jpg', // Cabbage Soup (Shchi)
  '53078': 'zadvgb1699012544.jpg', // Beetroot Soup (Borscht)
  '53079': '7n8su21699013057.jpg', // Fish Soup (Ukha)
  '53081': 'ebvuir1699013665.jpg', // Potato Salad (Olivier Salad)
  '53083': 'kos9av1699014767.jpg', // Lamb Pilaf (Plov)
  '53091': 'ae6clc1760524712.jpg', // Falafel Pita Sandwich with Tahini Sauce
  '53092': '21yc5s1760524759.jpg', // Fasoliyyeh Bi Z-Zayt (Syrian Green Beans with Olive Oil)
  '53093': '5fu4ew1760524857.jpg', // Syrian Spaghetti
  '53096': 'vz94r81760534692.jpg', // Corned Beef Hash
  '53098': 'pvfkz61761595976.jpg', // Cumberland Pie
  '53099': '44bzep1761848278.jpg', // Aussie Burgers
  '53102': 'wsu0rc1761848482.jpg', // Squid, chickpea & chorizo salad
  '53103': '4o4wh11761848573.jpg', // Barramundi with Moroccan spices
  '53105': 'a08uqk1761848682.jpg', // Spiced smoky barbecued chicken
  '53106': 'ktsws11761998344.jpg', // Warm roast asparagus salad
  '53107': 'flrajf1762341295.jpg', // Avocado dip with new potatoes
  '53108': 'cp74zo1762341241.jpg', // Quick salt & pepper squid
  '53109': '6sarfo1762340107.jpg', // Mini chilli beef pies
  '53110': 'cj56fs1762340001.jpg', // Sticky Chicken
  '53112': 'lqampv1762325397.jpg', // Kenyan Beef Curry
  '53113': '60o82j1762341177.jpg', // Sukuma Wiki
  '53115': 'ppodrp1762325183.jpg', // Red onion pickle
  '53117': '8a8fu01762772651.jpg', // Nordic smørrebrød with asparagus and horseradish cream
  '53122': 'raqjbj1762773035.jpg', // Fiskesuppe (Creamy Norwegian Fish Soup)
  '53123': 'ttfxxn1762773067.jpg', // Fårikål (Norwegian National Dish)
  '53124': 'hhm7xy1763075871.jpg', // Raspeballer (Norwegian Potato Dumplings)
  '53125': '0bpjb11763075817.jpg', // Karbonader (Lean Beef Patties) with Caramelized Onions
  '53126': '6vi2cv1763075785.jpg', // Brun Lapskaus (Norwegian Beef Vegetable Stew)
  '53133': 'kgfh3q1763075438.jpg', // Asado
  '53134': 'q99te31763075494.jpg', // Empanadas
  '53135': 'wdfa171763065079.jpg', // Milanesa
  '53136': '5i25sg1763075353.jpg', // Choripán
  '53140': 'wf49qs1763075222.jpg', // Matambre a la Pizza
  '53141': '8b2msz1763074897.jpg', // Carbonada Criolla
  '53142': '7b862e1763194846.jpg', // Spiced tortilla
  '53143': 'kzxflc1763194887.jpg', // Easy Spanish chicken
  '53144': 'ze8uwg1763196123.jpg', // Gambas al ajillo
  '53145': 'zc9cwz1763196177.jpg', // Jamon & wild garlic croquetas
  '53147': 'jc6oub1763196663.jpg', // Arroz con gambas y calamar
  '53150': '0ljvc51763248075.jpg', // Padron peppers
  '53151': '9bl20p1763248192.jpg', // Paella
  '53152': '4yjart1763248459.jpg', // Pan-fried hake, white bean & chorizo broth
  '53154': '92wbmf1763252334.jpg', // Clam, chorizo & white bean stew
  '53155': '8ovxf41763253962.jpg', // Spanish chicken pie
  '53156': 'qt4i0n1763256454.jpg', // Arroz al horno (baked rice)
  '53157': 'v8eaed1763257313.jpg', // Chorizo & soft-boiled egg salad
  '53158': '3m8yae1763257951.jpg', // Air fryer patatas bravas
  '53159': '0y6uvc1763258983.jpg', // Chorizo, potato & cheese omelette
  '53160': '0nswfe1763279040.jpg', // Pisto con huevos
  '53161': 'fk80jp1763280767.jpg', // Chicken & chorizo rice pot
  '53162': 'li30ck1763281992.jpg', // Pollo en pepitoria
  '53164': 'pqulvm1763282839.jpg', // Spanish Chicken
  '53166': 'xvnx8j1763287209.jpg', // Chickpea, chorizo & spinach stew
  '53167': '5r5rvx1763287943.jpg', // Seafood rice
  '53168': 'kggfo91763288633.jpg', // Chorizo & chickpea soup
  '53171': 'njj1681763297231.jpg', // Salt cod tortilla
  '53172': 'bvg8sn1763298713.jpg', // Patatas bravas
  '53174': 'u03xhi1763308917.jpg', // Prawns with Romesco sauce
  '53175': '9kwatm1763327074.jpg', // Spanish-style slow-cooked lamb shoulder & beans
  '53176': 'hsp1fo1763327867.jpg', // Spanish tomato bread with jamón Serrano
  '53177': 'vpcqn01763335688.jpg', // Spaghetti with Spanish flavours
  '53178': 'yhi46r1763330279.jpg', // Fried calamari
  '53179': '6dpa7m1763331105.jpg', // Ham croquetas
  '53180': 'u2lhqb1763331899.jpg', // Garlicky prawns with sherry
  '53181': 'bpkxtw1763332446.jpg', // Spanish beans with chicken & chorizo
  '53182': 'c6ghxm1763335584.jpg', // Spanish seafood rice
  '53184': 'sl6vqv1763335988.jpg', // Spanish rice & prawn one-pot
  '53185': '6cskio1763338156.jpg', // Chorizo & tomato salad
  '53186': '4mhr3u1763481087.jpg', // Chicken with saffron, raisins & pine nuts
  '53188': 'gtpvwp1763363947.jpg', // Fašírky
  '53190': 'g33c901763365484.jpg', // Bryndzové Halušky
  '53191': 'rg9ze01763479093.jpg', // Pad Thai
  '53192': '0dhtwr1763371444.jpg', // Panang chicken curry (kaeng panang gai)
  '53193': '2wx8cm1763373419.jpg', // Drunken noodles (pad kee mao)
  '53194': 'l50vz41763422681.jpg', // Tom yum soup with prawns
  '53195': '118oj61763423896.jpg', // Thai curry noodle soup
  '53196': '9c5nlx1763424766.jpg', // Tom yum (hot & sour) soup with prawns
  '53197': 'snmtd61763426568.jpg', // Thai pork & peanut curry
  '53198': 'hblwvg1763478203.jpg', // Thai fried rice with prawns & peas
  '53199': 'kyuxew1763479470.jpg', // Thai beef stir-fry
  '53200': '96lt871763480970.jpg', // Prawn stir-fry
  '53201': 'el64dy1763483009.jpg', // Stir-fried chicken with chillies & basil
  '53202': 'yx8j1i1763484612.jpg', // Thai-style steamed fish
  '53203': '6g3rso1763486069.jpg', // Thai rice noodle salad
  '53204': 'prjve31763486864.jpg', // Red curry chicken kebabs
  '53205': 'qqlwv91763501559.jpg', // Thai prawn curry
  '53206': '6s3i3p1763488540.jpg', // Thai chicken cakes with sweet chilli sauce
  '53207': 'ol2xxt1763582263.jpg', // Tom kha gai
  '53208': '4k8nzy1763583384.jpg', // Thai coconut & veg broth
  '53209': '568t931763584227.jpg', // Spicy Thai prawn noodles
  '53210': '1brbso1763585098.jpg', // Thai pumpkin soup
  '53211': 'ntafxw1763586291.jpg', // Lemongrass beef stew with noodles
  '53212': 'ittake1763586925.jpg', // Thai drumsticks
  '53213': 'a2ec961763587756.jpg', // Thai-style fish broth with greens
  '53214': '7kb44y1763589084.jpg', // Thai green chicken soup
  '53217': 'swo87v1763595282.jpg', // Shawarma chuck roast wrap
  '53218': 'hcg6l91763596970.jpg', // Chicken Shawarma with homemade garlic herb yoghurt sauce
  '53220': 'utqnjv1763598650.jpg', // kabse
  '53222': 'eo0yfb1763600916.jpg', // Vegetarian Shakshuka
  '53227': 'sfahy01763752319.jpg', // Rice paper dumplings
  '53228': 'p02vq41763754350.jpg', // Vietnamese caramel trout
  '53229': 'st9shl1763755808.jpg', // Steak & Vietnamese noodle salad
  '53231': '7xte3u1763757761.jpg', // Vietnamese lamb shanks with sweet potatoes
  '53232': 'pk8wtn1763758591.jpg', // Vietnamese chicken salad
  '53233': 'yxiilf1763759428.jpg', // Salt & pepper squid
  '53234': 'ikizdm1763760862.jpg', // Salmon noodle soup
  '53235': '4mzt101763761546.jpg', // Vietnamese-style caramel pork
  '53236': '4uje7l1763762276.jpg', // Vietnamese-style veggie hotpot
  '53237': 'g7jomp1763763994.jpg', // Vietnamese pork salad
  '53238': 'pbzcrx1763765096.jpg', // Beef pho
  '53239': '4xcfai1763765676.jpg', // Bang bang prawn salad
  '53240': 'minfsc1763766806.jpg', // Tofu, greens & cashew stir-fry
  '53241': 'f698g91763768731.jpg', // Vietnamese veg parcels
  '53242': 'tzsy461763769901.jpg', // Barbecue pork buns
  '53243': '9r2xrg1763771238.jpg', // Vietnamese prawn spiralized rolls
  '53244': '0iryz91763778419.jpg', // Prawn & noodle salad with crispy shallots
  '53245': 'zry07j1763779321.jpg', // Noodle bowl salad
  '53246': 'dbazbg1763779999.jpg', // Tangy carrot, cabbage & onion salad
  '53247': 'tqd7s21763780609.jpg', // Sea bass with sizzled ginger, chilli & spring onions
  '53248': 'prrirc1763781360.jpg', // Salmon noodle wraps
  '53250': 'sonirb1763782831.jpg', // Vegan banh mi
  '53251': 'tqd3ac1763786065.jpg', // Turkish lahmacun
  '53253': 'ampz9v1763787134.jpg', // Imam bayildi with BBQ lamb & tzatziki
  '53254': 'pb6mj11763788331.jpg', // Ezme
  '53255': 'ctw3ba1763788978.jpg', // Grilled aubergines with spicy chickpeas & walnut sauce
  '53257': 'lgmnff1763789847.jpg', // kofta burgers
  '53258': 'jyylmo1763790808.jpg', // Hot cumin lamb wrap with crunchy slaw & spicy mayo
  '53260': 'gr4lo51763791826.jpg', // Slow-roast lamb with cinnamon, fennel & citrus
  '53261': '4hzyvq1763792564.jpg', // Chicken wings with cumin, lemon & garlic
  '53262': '04axct1763793018.jpg', // Adana kebab
  '53263': 'cr2kyr1763793839.jpg', // Turkish lamb pilau
  '53264': '3um6il1763794322.jpg', // Smoky chicken skewers
  '53265': '8xuvhj1763794991.jpg', // Chilli ginger lamb chops
  '53266': 'u5e9qq1763795441.jpg', // Falafel
  '53267': '02s6gc1763799560.jpg', // Aubergine couscous salad
  '53268': 'ro8mzj1763800655.jpg', // Roasted chicken with creamy walnut sauce
  '53270': '0p7l6b1763813981.jpg', // Turkish-style lamb
  '53273': 'iydbwy1763816111.jpg', // Roast aubergine with goats cheese & toasted flatbread
  '53274': 'yoj48r1763817100.jpg', // Griddled aubergines with sesame dressing
  '53275': 'z458v91763817681.jpg', // Sweet potato salad
  '53277': '72fgzj1764109947.jpg', // Lamb & apricot meatballs
  '53278': 'zub3s91764110535.jpg', // Aubergine & hummus grills
  '53280': 'nlxald1764112200.jpg', // Poulet Roti a lAlgerienne (Algerian Roast Chicken)
  '53281': '8rfd4q1764112993.jpg', // Algerian Kefta (Meatballs)
  '53283': 'q8pu1k1764114334.jpg', // Chtitha Batata (Algerian Potato Stew)
  '53287': 'd8bfyg1764117503.jpg', // Tajine de Poulet aux Carottes et Patates Douces (Chicken and Sweet Potato Tagine)
  '53288': 'tbj1bs1764118062.jpg', // Algerian Flafla (Bell Pepper Salad)
  '53289': 'p9tebp1764118792.jpg', // Chorba Hamra bel Frik (Algerian Lamb, Tomato, and Freekeh Soup)
  '53294': '72lmpt1764122511.jpg', // Zapiekanki
  '53296': 'ckbx1h1764123606.jpg', // Sauerkraut pierogi
  '53297': 'fqpqml1764359125.jpg', // Pomegranate salad
  '53300': 'fl4brj1764361323.jpg', // Bigos (Polish hunters stew)
  '53301': 'cyuhwp1764362103.jpg', // Pork & sauerkraut goulash
  '53302': 'w36ets1764362474.jpg', // Slow-roasted ham with lemon, garlic & sage
  '53305': 'z267f71764364072.jpg', // Braised stuffed cabbage
  '53306': 'om5hsl1764364721.jpg', // Pork rib bortsch
  '53307': 'ra2k8a1764365055.jpg', // Beetroot & red cabbage sauerkraut
  '53309': 'ei21r61764365935.jpg', // Cucumber & fennel salad
  '53311': '804v1j1764367088.jpg', // Borsch
  '53312': 'e2g2r21764367568.jpg', // Tangy cabbage slaw
  '53313': 'qwicc91764368097.jpg', // Beetroot latkes
  '53314': 'gqlxgc1764368767.jpg', // Sauerkraut pierogii
  '53315': 's1jxzl1764369317.jpg', // Rosemary braised red cabbage with kabanos
  '53317': 'dxpc7j1764370714.jpg', // Beef Empanadas
  '53318': 'okl9cm1764371087.jpg', // Torta de fiambre
  '53319': 'j80gmw1764372176.jpg', // Chivito sandwich
  '53326': '8859m71764377470.jpg', // Venezuelan Sancocho
  '53327': 'z2sw3o1764378271.jpg', // Venezuelan Coconut Chicken
  '53328': 'mq27gf1764436795.jpg', // Venezuelan Shredded Beef
  '53329': 'jgl9qq1764437635.jpg', // Arepa pelua
  '53330': 'lrfdwz1764438393.jpg', // Cassava pizza
  '53334': '13fg4j1764441982.jpg', // Arepa Pabellón
  '53335': 'z1tfnw1764443171.jpg', // Jiggs Dinner
  '53336': '9tddhg1764443699.jpg', // Molasses Baked Beans
  '53340': 'xihv0c1764447887.jpg', // Hodge Podge
  '53343': '0sd7ac1764787957.jpg', // Classic Tourtière
  '53345': 'o5fuq51764789643.jpg', // Jamaican Curry Chicken Recipe
  '53349': 'bx07m71764792853.jpg', // Jamaican Pepper Shrimp
  '53350': 'kdz63q1764793442.jpg', // Corned Beef and Cabbage – Jamaican Style
  '53352': '11bvtm1764795135.jpg', // Jamaican Instant Pot Rice and Beans
  '53354': 'uc9qp11764796575.jpg', // Jamaican Curry Goat
  '53357': 'pkyvrn1764878267.jpg', // Jamaican Rice and Peas
  '53358': 'er4d081765186828.jpg', // Chicken Mandi
  '53359': '1nalo51765188375.jpg', // Beef Mandi
  '53362': 'n7h5zs1765318909.jpg', // Jamaican Curry Shrimp Recipe
  '53365': 's73ytv1765567838.jpg', // Chinese Orange Chicken
  '53366': 'm0p0j81765568742.jpg', // Beef and Broccoli Stir-Fry
  '53367': 'wuyd2h1765655837.jpg', // Chicken Fried Rice
  '53368': 'f3cxnc1765656994.jpg', // Singapore Noodles with Shrimp
  '53369': 'j9nray1765657692.jpg', // Silken Tofu with Sesame Soy Sauce
  '53370': '47y6ii1765658818.jpg', // Egg Foo Young
  '53371': 'i0610h1765659464.jpg', // Sichuan Style Stir-Fried Chinese Long Beans
  '53372': 'rwvw8q1765660071.jpg', // Chinese Tomato Egg Stir Fry
  '53374': '1oz4nb1765687990.jpg', // Sichuan Eggplant
  '53375': 'fpl3mv1766433431.jpg', // Shrimp With Snow Peas
  '53376': 'arzs741766434335.jpg', // Sweet and Sour Chicken
  '53377': '9nh4dl1766435484.jpg', // Napa Cabbage with Dried Shrimp
  '53398': 'walmi81779552709.jpg', // Kadu Borani
  '53400': '4kzx4d1779554755.jpg', // Mastawa Lamb and Rice
  '53404': 'a1mi7t1779643816.jpg', // Tavë Kosi Baked Lamb and Yogurt
  '53405': 'p5m3w21779644533.jpg', // Tavë me Presh ska Mish Meatless Leek Bake
  '53407': 'ae4rwb1779645576.jpg', // Lakror me Kungull Summer Squash Pie
  '53410': 'sjfgbc1779647169.jpg', // Presh me Oriz Leek and Rice Bake
  '53412': 'mobh1l1779648766.jpg', // Lakra me Mish Cabbage and Meat Stew
  '53416': 'khpso71779732715.jpg', // Trinxat (Potato, Cabbage and Bacon Hash)
  '53417': 'lz9rw91779733434.jpg', // Pa Amb Tomaquet (Bread with Tomato)
  '53418': 'wympxc1779734808.jpg', // Cambodian Stir-fried Morning Glory with Pork, Fermented Soybeans, and Garlic
  '53419': '9q1ci41779735714.jpg', // Crispy fried fish with ginger and fermented soybeans (trey chien chuon)
  '53421': 't2b8bn1779737789.jpg', // BEEF LOK LAK (Lok Lak Sach Ko)
  '53423': '5rk8vc1779740302.jpg', // Meang Nem
  '53427': '0dypw51779817467.jpg', // Lao Naem Khao
  '53428': 'jg4r991779916649.jpg', // Camaro Grelhado Com Molho Cru (Grilled Prawns with Green Onion Sauce)
  '53432': 't1hg8s1780087329.jpg', // Slow-cooked, Wadadli-spiced Cubano pork belly
  '53437': 'vy6k391780090969.jpg', // Leg of Lamb Armenian-Style
  '53440': 'qqwhw51780093126.jpg', // Balchi di Pisca
  '53443': 'dqxtlh1780153831.jpg', // Satee
  '53444': 'jbw8m11780155348.jpg', // Tirolean Dumplings
  '53445': 'x26z3y1780155760.jpg', // Kaspressknödel - Cheese Dumplings
  '53447': 'svf3d01780298321.jpg', // Tafelspitz
  '53449': '7vdtqi1780160088.jpg', // Kelem dolmasi
  '53451': 'r7mcjm1780261264.jpg', // Bangladeshi fish curry with daikon
  '53453': '9ya6o71780262651.jpg', // Bengali Chicken Curry with Potatoes
  '53455': 'hob03q1780264260.jpg', // Chicken Liver Pate Recipe
  '53457': '5tf8j11782236249.jpg', // Barbados Pepperpot
  '53459': 'mp9z0i1782238092.jpg', // Chicken and Potato Roti
  '53461': 'kpiu4t1782242131.jpg', // Macaroni Pie
  '53463': 'gjjlzc1782496055.jpg', // Belgian Meatballs in Liège Syrup Sauce
  '53464': '2lywl71782496853.jpg', // Flemish Hutsepot
  '53466': 'nmxec11782498644.jpg', // Belgian Waterzooi Chicken
  '53467': 'ji3mho1782499823.jpg', // Liegeoise Salad
  '53468': 'byolko1782500400.jpg', // Belgian Stoemp
  '53469': 'k07k271782502861.jpg', // Beef pumpkin Stew
  '53470': 'p7eid81782503889.jpg', // Seswaa
  '53478': 'k1if4d1782589892.jpg', // Grilled corn with garlic mayo & grated cheese
  '53480': '81j8iu1782590903.jpg', // Creamy Aji green sauce
  '53481': 'e2kcut1782591669.jpg', // Bahia-style Moqueca prawn stew
  '53482': 'xrxz7h1782592711.jpg', // Black bean & meat stew - feijoada
  '53483': 'dxs5t71782678369.jpg', // Acaraje black-eyed pea fritters with shrimp filling
  '53486': 'p5nzbk1782680889.jpg', // Easy White Bean Soup
  '53488': 'brmxra1782681940.jpg', // Cabbage with Ground Beef
  '53489': '08ez421782683409.jpg', // Potato Moussaka Recipe
  '53490': 'w0rsga1782683912.jpg', // Cottage Cheese And Feta Stuffed Peppers
  '53491': 'bqx8mc1782684286.jpg', // Shopska Salad
  '53495': 'diuub11782687570.jpg', // Amok Trey – Cambodian Fish Curry
  '53496': 'f0cdwk1782688162.jpg', // Bai Sach Chrouk – Grilled Pork with Rice
  '53497': '6g9gif1782688663.jpg', // Nom Banh Chok – Cambodian Noodle Soup
  '53498': 'k5qzdl1782689660.jpg', // Samlar Kari – Khmer Red Curry
  '53499': 'g80f4t1782690273.jpg', // Prahok Ktis – Pork and Coconut Dip
  '53501': 'o93jur1782769321.jpg', // Num Pang – Cambodian Baguette Sandwich
  '53502': 'xrv78g1782769859.jpg', // Khmer Banh Xeo – Cambodian Savory Pancake
  '53503': 'bmbvjk1782770310.jpg', // Samlar Machu Kreung – Cambodian Sour Stew
  '53504': 'hbte551782770868.jpg', // Macaroni Pudding
  '53505': 'nmtq3n1782772031.jpg', // Conch Fritters
  '53506': 'j8c1d51782772399.jpg', // Rice and Beans
  '53509': 'rprcc51782774240.jpg', // Fried Crab
  '53510': 'wkhwqr1782774765.jpg', // Cayman-Style Lobster
  '53511': 'dnd87q1782775269.jpg', // Salt Beef and Beans
  '53512': 'mlkjeu1782775816.jpg', // Conch Stew
  '53514': 'q4xgij1782851193.jpg', // Chilean Empanada
  '53517': 'h031jy1782853081.jpg', // Pastel de Papas (Chilean Potato Pie)
  '53518': '9tllzd1782853513.jpg', // Empanadas Fritas de Queso
  '53520': '47abic1782854326.jpg', // Pastel de Choclo
  '53528': '087fu71783802698.jpg', // Chuletas de Cerdo a la Criolla (Pork Chops in Creole Sauce)
  '53530': '4htbtm1783803558.jpg', // Creamy Mustard Chicken
  '53531': 'uuns781783804024.jpg', // Chicken in Orange Sauce Recipe (Pollo a la Naranja)
  '53532': 'yf5eyw1783804464.jpg', // Creamy Corn Soup Recipe
  '53533': 'lmwaf61783805434.jpg', // Breaded Steak Recipe (Lomo de Res Apanado)
  '53536': '81ahfr1784394567.jpg', // Black Beans Hotpot
  '53539': '2ncui81784396094.jpg', // Picadillo de Vainicas (Green Beans Picadillo)
  '53540': '4o13oe1784396585.jpg', // Pollo en Salsa
  '53541': 'ytogg31784397116.jpg', // Gallo pinto
  '53545': 'thvft91784576451.jpg', // Ropa Veija
  '53547': 'djdg8l1784578885.jpg', // Cuban Sandwich
  '53549': 't5rgav1784659936.jpg', // Chicken Salad With Mushrooms and Bacon
  '53553': 'bnhfa71784662834.jpg', // Frikadeller - Danish Meatballs
  '53554': 'wooxjq1784663522.jpg', // Open-faced Sandwich With Potato
  '53557': 'feh9k21784665694.jpg', // Extra crispy chicken wings
  '53561': 'vayi021784668764.jpg', // Codfish deviled eggs
  '53565': 'nz0lg71784671684.jpg', // Chicken Lollipop
  '53573': '7ytdtz1784833420.jpg', // Papaya salad
  '53576': 'xjii2g1784836867.jpg', // Carrot and Bean Fritters
  '53577': '2i0plx1784837241.jpg', // Sauerkraut and Fish Salad
};

/** Full-size photo URL, or undefined if the id is unknown. */
export const photoUrl = (mdbId?: string) => (mdbId && PHOTOS[mdbId] ? BASE + PHOTOS[mdbId] : undefined);

/** Self-hosted Wikimedia Commons photo for a recipe without a TheMealDB match (see photoCredits.ts). */
export const localPhoto = (recipeId: string) => (LOCAL_PHOTOS[recipeId] ? `${import.meta.env.BASE_URL}photos/${recipeId}.jpg` : undefined);

/** TheMealDB serves resized variants at /small (250px) and /medium (500px); our own photos are already small. */
export const photoThumb = (url?: string) => (url ? (url.startsWith(BASE) ? `${url}/medium` : url) : undefined);
