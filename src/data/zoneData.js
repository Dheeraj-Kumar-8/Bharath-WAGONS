// Central zone-scoped data — every page reads from here filtered by admin.zone

export const ALL_WAGONS = [
  // NR
  { id:"WGN-N01", type:"Freight", location:"New Delhi",   dest:"Mumbai CST",  speed:"87", status:"On Time",    capacity:"60T", zone:"NR"  },
  { id:"WGN-N02", type:"Tank",    location:"Lucknow",     dest:"Kolkata",     speed:"81", status:"On Time",    capacity:"45T", zone:"NR"  },
  { id:"WGN-N03", type:"Flatbed", location:"Patna",       dest:"New Delhi",   speed:"68", status:"Delayed",    capacity:"55T", zone:"NR"  },
  { id:"WGN-N04", type:"Freight", location:"Kanpur",      dest:"Delhi",       speed:"0",  status:"Maintenance",capacity:"60T", zone:"NR"  },
  { id:"WGN-N05", type:"Tank",    location:"Allahabad",   dest:"Varanasi",    speed:"74", status:"On Time",    capacity:"45T", zone:"NR"  },
  // SR
  { id:"WGN-S01", type:"Freight", location:"Chennai Ctrl",dest:"Hyderabad",   speed:"64", status:"Delayed",    capacity:"60T", zone:"SR"  },
  { id:"WGN-S02", type:"Tank",    location:"Coimbatore",  dest:"Bengaluru",   speed:"59", status:"On Time",    capacity:"45T", zone:"SR"  },
  { id:"WGN-S03", type:"Flatbed", location:"Madurai",     dest:"Chennai",     speed:"71", status:"On Time",    capacity:"55T", zone:"SR"  },
  { id:"WGN-S04", type:"Freight", location:"Trichy",      dest:"Salem",       speed:"0",  status:"Maintenance",capacity:"60T", zone:"SR"  },
  { id:"WGN-S05", type:"Freight", location:"Salem",       dest:"Coimbatore",  speed:"66", status:"On Time",    capacity:"60T", zone:"SR"  },
  // ER
  { id:"WGN-E01", type:"Freight", location:"Howrah",      dest:"New Delhi",   speed:"92", status:"On Time",    capacity:"60T", zone:"ER"  },
  { id:"WGN-E02", type:"Tank",    location:"Asansol",     dest:"Dhanbad",     speed:"55", status:"Delayed",    capacity:"45T", zone:"ER"  },
  { id:"WGN-E03", type:"Flatbed", location:"Durgapur",    dest:"Kolkata",     speed:"78", status:"On Time",    capacity:"55T", zone:"ER"  },
  { id:"WGN-E04", type:"Freight", location:"Kharagpur",   dest:"Bhubaneswar", speed:"0",  status:"Maintenance",capacity:"60T", zone:"ER"  },
  { id:"WGN-E05", type:"Freight", location:"Malda",       dest:"Howrah",      speed:"63", status:"On Time",    capacity:"60T", zone:"ER"  },
  // WR
  { id:"WGN-W01", type:"Freight", location:"Ahmedabad",   dest:"New Delhi",   speed:"55", status:"Delayed",    capacity:"60T", zone:"WR"  },
  { id:"WGN-W02", type:"Tank",    location:"Surat",       dest:"Ahmedabad",   speed:"90", status:"On Time",    capacity:"45T", zone:"WR"  },
  { id:"WGN-W03", type:"Flatbed", location:"Vadodara",    dest:"Mumbai",      speed:"72", status:"On Time",    capacity:"55T", zone:"WR"  },
  { id:"WGN-W04", type:"Freight", location:"Rajkot",      dest:"Surat",       speed:"0",  status:"Maintenance",capacity:"60T", zone:"WR"  },
  { id:"WGN-W05", type:"Freight", location:"Bharuch",     dest:"Vadodara",    speed:"68", status:"On Time",    capacity:"60T", zone:"WR"  },
  // NER
  { id:"WGN-NE1", type:"Freight", location:"Guwahati",    dest:"Kolkata",     speed:"61", status:"On Time",    capacity:"60T", zone:"NER" },
  { id:"WGN-NE2", type:"Tank",    location:"Dibrugarh",   dest:"Guwahati",    speed:"48", status:"Delayed",    capacity:"45T", zone:"NER" },
  { id:"WGN-NE3", type:"Flatbed", location:"Silchar",     dest:"Lumding",     speed:"54", status:"On Time",    capacity:"55T", zone:"NER" },
  { id:"WGN-NE4", type:"Freight", location:"Jorhat",      dest:"Dibrugarh",   speed:"0",  status:"Maintenance",capacity:"60T", zone:"NER" },
  { id:"WGN-NE5", type:"Freight", location:"Tinsukia",    dest:"Guwahati",    speed:"57", status:"On Time",    capacity:"60T", zone:"NER" },
  // NWR
  { id:"WGN-NW1", type:"Freight", location:"Jaipur",      dest:"Delhi",       speed:"79", status:"On Time",    capacity:"60T", zone:"NWR" },
  { id:"WGN-NW2", type:"Tank",    location:"Jodhpur",     dest:"Jaipur",      speed:"0",  status:"Maintenance",capacity:"45T", zone:"NWR" },
  { id:"WGN-NW3", type:"Flatbed", location:"Bikaner",     dest:"Jodhpur",     speed:"66", status:"On Time",    capacity:"55T", zone:"NWR" },
  { id:"WGN-NW4", type:"Freight", location:"Udaipur",     dest:"Ahmedabad",   speed:"58", status:"Delayed",    capacity:"60T", zone:"NWR" },
  { id:"WGN-NW5", type:"Freight", location:"Kota",        dest:"Mumbai",      speed:"83", status:"On Time",    capacity:"60T", zone:"NWR" },
  // SER
  { id:"WGN-SE1", type:"Freight", location:"Bhubaneswar", dest:"Kolkata",     speed:"76", status:"On Time",    capacity:"60T", zone:"SER" },
  { id:"WGN-SE2", type:"Tank",    location:"Vizag",       dest:"Chennai",     speed:"0",  status:"Maintenance",capacity:"45T", zone:"SER" },
  { id:"WGN-SE3", type:"Flatbed", location:"Raipur",      dest:"Nagpur",      speed:"69", status:"On Time",    capacity:"55T", zone:"SER" },
  { id:"WGN-SE4", type:"Freight", location:"Bilaspur",    dest:"Raipur",      speed:"52", status:"Delayed",    capacity:"60T", zone:"SER" },
  { id:"WGN-SE5", type:"Freight", location:"Sambalpur",   dest:"Bhubaneswar", speed:"73", status:"On Time",    capacity:"60T", zone:"SER" },
  // SWR
  { id:"WGN-SW1", type:"Freight", location:"Bengaluru",   dest:"Chennai",     speed:"78", status:"On Time",    capacity:"60T", zone:"SWR" },
  { id:"WGN-SW2", type:"Tank",    location:"Mysuru",      dest:"Bengaluru",   speed:"62", status:"On Time",    capacity:"45T", zone:"SWR" },
  { id:"WGN-SW3", type:"Flatbed", location:"Hubballi",    dest:"Pune",        speed:"0",  status:"Maintenance",capacity:"55T", zone:"SWR" },
  { id:"WGN-SW4", type:"Freight", location:"Belagavi",    dest:"Hubballi",    speed:"55", status:"Delayed",    capacity:"60T", zone:"SWR" },
  { id:"WGN-SW5", type:"Freight", location:"Mangaluru",   dest:"Bengaluru",   speed:"70", status:"On Time",    capacity:"60T", zone:"SWR" },
];

export const ZONE_STATS = {
  NR:  { total:312, active:298, delayed:9,  maint:5,  stations:38, gps:291, alerts:7,  cargo:820  },
  SR:  { total:198, active:189, delayed:6,  maint:3,  stations:24, gps:186, alerts:4,  cargo:540  },
  ER:  { total:224, active:214, delayed:7,  maint:3,  stations:28, gps:210, alerts:6,  cargo:610  },
  WR:  { total:156, active:149, delayed:4,  maint:3,  stations:19, gps:146, alerts:3,  cargo:430  },
  NER: { total:98,  active:91,  delayed:5,  maint:2,  stations:12, gps:88,  alerts:5,  cargo:210  },
  NWR: { total:112, active:105, delayed:5,  maint:2,  stations:14, gps:102, alerts:4,  cargo:290  },
  SER: { total:143, active:136, delayed:5,  maint:2,  stations:17, gps:133, alerts:3,  cargo:380  },
  SWR: { total:127, active:122, delayed:4,  maint:2,  stations:15, gps:118, alerts:2,  cargo:320  },
};

export const ZONE_CITIES = {
  NR:  [{ name:"New Delhi", active:142,moving:128,delayed:11,offline:3},{ name:"Lucknow",    active:68, moving:61, delayed:5, offline:2},{ name:"Kanpur",    active:52,moving:47,delayed:4,offline:1},{ name:"Patna",     active:36,moving:32,delayed:3,offline:1}],
  SR:  [{ name:"Chennai",   active:96, moving:88, delayed:6, offline:2},{ name:"Coimbatore", active:42, moving:38, delayed:3, offline:1},{ name:"Madurai",   active:34,moving:30,delayed:2,offline:1},{ name:"Trichy",    active:27,moving:24,delayed:2,offline:0}],
  ER:  [{ name:"Howrah",    active:112,moving:102,delayed:7, offline:3},{ name:"Asansol",    active:48, moving:43, delayed:4, offline:1},{ name:"Durgapur",  active:36,moving:32,delayed:3,offline:1},{ name:"Kharagpur", active:28,moving:25,delayed:2,offline:0}],
  WR:  [{ name:"Ahmedabad", active:78, moving:71, delayed:5, offline:2},{ name:"Surat",      active:42, moving:38, delayed:3, offline:1},{ name:"Vadodara",  active:34,moving:31,delayed:2,offline:1},{ name:"Rajkot",    active:26,moving:23,delayed:2,offline:0}],
  NER: [{ name:"Guwahati",  active:44, moving:39, delayed:4, offline:2},{ name:"Dibrugarh",  active:22, moving:19, delayed:3, offline:1},{ name:"Silchar",   active:18,moving:16,delayed:2,offline:1},{ name:"Tinsukia",  active:14,moving:12,delayed:1,offline:0}],
  NWR: [{ name:"Jaipur",    active:56, moving:51, delayed:4, offline:1},{ name:"Jodhpur",    active:28, moving:24, delayed:3, offline:1},{ name:"Bikaner",   active:22,moving:19,delayed:2,offline:0},{ name:"Udaipur",   active:18,moving:16,delayed:2,offline:0}],
  SER: [{ name:"Bhubaneswar",active:58,moving:53, delayed:4, offline:1},{ name:"Vizag",      active:38, moving:34, delayed:3, offline:1},{ name:"Raipur",    active:32,moving:29,delayed:2,offline:1},{ name:"Bilaspur",  active:24,moving:21,delayed:2,offline:0}],
  SWR: [{ name:"Bengaluru", active:62, moving:57, delayed:4, offline:1},{ name:"Mysuru",     active:28, moving:25, delayed:2, offline:1},{ name:"Hubballi",  active:24,moving:22,delayed:2,offline:0},{ name:"Belagavi",  active:18,moving:16,delayed:1,offline:0}],
};

export const ZONE_LINE_DATA = {
  NR:  [{day:"Mon",active:280,delayed:12},{day:"Tue",active:295,delayed:9 },{day:"Wed",active:288,delayed:11},{day:"Thu",active:301,delayed:8},{day:"Fri",active:296,delayed:9},{day:"Sat",active:298,delayed:9},{day:"Sun",active:290,delayed:9}],
  SR:  [{day:"Mon",active:182,delayed:7 },{day:"Tue",active:187,delayed:5 },{day:"Wed",active:184,delayed:6 },{day:"Thu",active:191,delayed:5},{day:"Fri",active:188,delayed:6},{day:"Sat",active:189,delayed:6},{day:"Sun",active:185,delayed:6}],
  ER:  [{day:"Mon",active:206,delayed:8 },{day:"Tue",active:212,delayed:6 },{day:"Wed",active:208,delayed:7 },{day:"Thu",active:216,delayed:6},{day:"Fri",active:213,delayed:7},{day:"Sat",active:214,delayed:7},{day:"Sun",active:210,delayed:7}],
  WR:  [{day:"Mon",active:142,delayed:5 },{day:"Tue",active:147,delayed:4 },{day:"Wed",active:144,delayed:4 },{day:"Thu",active:151,delayed:3},{day:"Fri",active:148,delayed:4},{day:"Sat",active:149,delayed:4},{day:"Sun",active:145,delayed:4}],
  NER: [{day:"Mon",active:86, delayed:6 },{day:"Tue",active:89, delayed:5 },{day:"Wed",active:87, delayed:5 },{day:"Thu",active:93, delayed:4},{day:"Fri",active:91, delayed:5},{day:"Sat",active:91, delayed:5},{day:"Sun",active:88, delayed:5}],
  NWR: [{day:"Mon",active:98, delayed:5 },{day:"Tue",active:103,delayed:5 },{day:"Wed",active:100,delayed:5 },{day:"Thu",active:107,delayed:4},{day:"Fri",active:104,delayed:5},{day:"Sat",active:105,delayed:5},{day:"Sun",active:101,delayed:5}],
  SER: [{day:"Mon",active:130,delayed:5 },{day:"Tue",active:134,delayed:5 },{day:"Wed",active:132,delayed:5 },{day:"Thu",active:138,delayed:4},{day:"Fri",active:135,delayed:5},{day:"Sat",active:136,delayed:5},{day:"Sun",active:132,delayed:5}],
  SWR: [{day:"Mon",active:116,delayed:4 },{day:"Tue",active:120,delayed:4 },{day:"Wed",active:118,delayed:4 },{day:"Thu",active:124,delayed:3},{day:"Fri",active:121,delayed:4},{day:"Sat",active:122,delayed:4},{day:"Sun",active:118,delayed:4}],
};

export const ZONE_BAR_DATA = {
  NR:  [{station:"Delhi",    arrivals:142,departures:138},{station:"Lucknow",    arrivals:68, departures:65},{station:"Kanpur",    arrivals:52,departures:50},{station:"Patna",     arrivals:36,departures:34}],
  SR:  [{station:"Chennai",  arrivals:96, departures:99 },{station:"Coimbatore", arrivals:42, departures:40},{station:"Madurai",   arrivals:34,departures:32},{station:"Trichy",    arrivals:27,departures:26}],
  ER:  [{station:"Howrah",   arrivals:112,departures:108},{station:"Asansol",    arrivals:48, departures:46},{station:"Durgapur",  arrivals:36,departures:35},{station:"Kharagpur", arrivals:28,departures:27}],
  WR:  [{station:"Ahmedabad",arrivals:78, departures:80 },{station:"Surat",      arrivals:42, departures:41},{station:"Vadodara",  arrivals:34,departures:33},{station:"Rajkot",    arrivals:26,departures:25}],
  NER: [{station:"Guwahati", arrivals:44, departures:42 },{station:"Dibrugarh",  arrivals:22, departures:21},{station:"Silchar",   arrivals:18,departures:17},{station:"Tinsukia",  arrivals:14,departures:13}],
  NWR: [{station:"Jaipur",   arrivals:56, departures:54 },{station:"Jodhpur",    arrivals:28, departures:27},{station:"Bikaner",   arrivals:22,departures:21},{station:"Udaipur",   arrivals:18,departures:17}],
  SER: [{station:"Bhubaneswar",arrivals:58,departures:56},{station:"Vizag",      arrivals:38, departures:37},{station:"Raipur",    arrivals:32,departures:31},{station:"Bilaspur",  arrivals:24,departures:23}],
  SWR: [{station:"Bengaluru", arrivals:62, departures:60},{station:"Mysuru",     arrivals:28, departures:27},{station:"Hubballi",  arrivals:24,departures:23},{station:"Belagavi",  arrivals:18,departures:17}],
};

export const ZONE_ALERTS = {
  NR:  [{wagon:"WGN-N03",type:"GPS Signal Lost",    priority:"Critical",time:"12:15 PM",status:"Active"  },{wagon:"WGN-N01",type:"Route Deviation",     priority:"High",   time:"12:18 PM",status:"Active"  },{wagon:"WGN-N04",type:"Brake Warning",       priority:"High",   time:"12:20 PM",status:"Pending" },{wagon:"WGN-N02",type:"Speed Limit Exceeded",priority:"Medium", time:"12:22 PM",status:"Resolved"}],
  SR:  [{wagon:"WGN-S01",type:"Route Deviation",    priority:"High",   time:"11:45 AM",status:"Active"  },{wagon:"WGN-S04",type:"Engine Anomaly",       priority:"Critical",time:"11:50 AM",status:"Active"  },{wagon:"WGN-S02",type:"Cargo Overweight",    priority:"Medium", time:"12:05 PM",status:"Pending" }],
  ER:  [{wagon:"WGN-E02",type:"GPS Signal Lost",    priority:"Critical",time:"10:30 AM",status:"Active"  },{wagon:"WGN-E04",type:"Door Open Detected",   priority:"High",   time:"10:45 AM",status:"Active"  },{wagon:"WGN-E01",type:"Speed Limit Exceeded",priority:"Medium", time:"11:00 AM",status:"Resolved"}],
  WR:  [{wagon:"WGN-W01",type:"Route Deviation",    priority:"High",   time:"09:15 AM",status:"Active"  },{wagon:"WGN-W04",type:"Brake Warning",        priority:"Critical",time:"09:30 AM",status:"Pending" },{wagon:"WGN-W02",type:"Cargo Overweight",    priority:"Low",    time:"09:50 AM",status:"Resolved"}],
  NER: [{wagon:"WGN-NE2",type:"GPS Signal Lost",    priority:"Critical",time:"08:00 AM",status:"Active"  },{wagon:"WGN-NE4",type:"Engine Anomaly",       priority:"High",   time:"08:20 AM",status:"Active"  },{wagon:"WGN-NE1",type:"Route Deviation",     priority:"Medium", time:"08:45 AM",status:"Pending" }],
  NWR: [{wagon:"WGN-NW4",type:"Route Deviation",    priority:"High",   time:"07:30 AM",status:"Active"  },{wagon:"WGN-NW2",type:"Brake Warning",        priority:"Critical",time:"07:45 AM",status:"Active"  },{wagon:"WGN-NW1",type:"Speed Limit Exceeded",priority:"Medium", time:"08:10 AM",status:"Resolved"}],
  SER: [{wagon:"WGN-SE2",type:"GPS Signal Lost",    priority:"Critical",time:"11:00 AM",status:"Active"  },{wagon:"WGN-SE4",type:"Route Deviation",      priority:"High",   time:"11:15 AM",status:"Active"  },{wagon:"WGN-SE1",type:"Cargo Overweight",    priority:"Low",    time:"11:30 AM",status:"Pending" }],
  SWR: [{wagon:"WGN-SW4",type:"Route Deviation",    priority:"High",   time:"10:00 AM",status:"Active"  },{wagon:"WGN-SW3",type:"Engine Anomaly",       priority:"Critical",time:"10:15 AM",status:"Active"  },{wagon:"WGN-SW1",type:"Speed Limit Exceeded",priority:"Medium", time:"10:40 AM",status:"Resolved"}],
};

export const ZONE_LOGS = {
  NR:  [{time:"12:31 PM",msg:"WGN-N03: GPS signal reconnected in Zone NR",        color:"#22c55e"},{time:"12:28 PM",msg:"AI Engine: Route optimisation applied for WGN-N01", color:"#3b82f6"},{time:"12:22 PM",msg:"WGN-N02: Speed alert auto-resolved",                color:"#22c55e"},{time:"12:20 PM",msg:"WGN-N04: Brake warning triggered at Kanpur",         color:"#ef4444"},{time:"12:15 PM",msg:"WGN-N03: GPS signal lost in Zone NR",                 color:"#ef4444"},{time:"12:05 PM",msg:"Server NR: Auto-backup completed successfully",       color:"#22c55e"}],
  SR:  [{time:"11:55 AM",msg:"WGN-S04: Engine anomaly detected at Trichy",         color:"#ef4444"},{time:"11:50 AM",msg:"WGN-S01: Route deviation detected by NavIC",          color:"#ef4444"},{time:"11:45 AM",msg:"AI Engine: Maintenance forecast updated for SR",      color:"#3b82f6"},{time:"11:30 AM",msg:"WGN-S02: Cargo overweight alert raised",              color:"#f59e0b"},{time:"11:20 AM",msg:"Server SR: Auto-backup completed successfully",       color:"#22c55e"}],
  ER:  [{time:"11:05 AM",msg:"WGN-E02: GPS signal lost near Asansol",              color:"#ef4444"},{time:"10:50 AM",msg:"WGN-E04: Door open alert at Kharagpur yard",           color:"#ef4444"},{time:"10:35 AM",msg:"AI Engine: Route optimisation applied for WGN-E01",  color:"#3b82f6"},{time:"10:15 AM",msg:"WGN-E01: Speed alert auto-resolved",                 color:"#22c55e"},{time:"10:05 AM",msg:"Server ER: Auto-backup completed successfully",       color:"#22c55e"}],
  WR:  [{time:"09:55 AM",msg:"WGN-W04: Brake warning triggered at Rajkot",         color:"#ef4444"},{time:"09:30 AM",msg:"WGN-W01: Route deviation detected near Ahmedabad",   color:"#ef4444"},{time:"09:20 AM",msg:"AI Engine: Fuel efficiency improved by 3.1% in WR",  color:"#3b82f6"},{time:"09:05 AM",msg:"WGN-W02: Cargo overweight auto-resolved",            color:"#22c55e"},{time:"08:55 AM",msg:"Server WR: Auto-backup completed successfully",       color:"#22c55e"}],
  NER: [{time:"08:50 AM",msg:"WGN-NE2: GPS signal lost near Dibrugarh",            color:"#ef4444"},{time:"08:30 AM",msg:"WGN-NE4: Engine anomaly flagged at Jorhat",            color:"#ef4444"},{time:"08:20 AM",msg:"AI Engine: Delay prediction updated for Zone NER",   color:"#3b82f6"},{time:"08:00 AM",msg:"WGN-NE1: Route deviation resolved",                  color:"#22c55e"},{time:"07:50 AM",msg:"Server NER: Auto-backup completed successfully",      color:"#22c55e"}],
  NWR: [{time:"08:15 AM",msg:"WGN-NW2: Brake warning at Jodhpur depot",            color:"#ef4444"},{time:"08:00 AM",msg:"WGN-NW4: Route deviation near Udaipur",              color:"#ef4444"},{time:"07:50 AM",msg:"AI Engine: Route optimisation applied for WGN-NW1",  color:"#3b82f6"},{time:"07:35 AM",msg:"WGN-NW1: Speed alert auto-resolved",                 color:"#22c55e"},{time:"07:20 AM",msg:"Server NWR: Auto-backup completed successfully",      color:"#22c55e"}],
  SER: [{time:"11:35 AM",msg:"WGN-SE2: GPS signal lost near Vizag port",           color:"#ef4444"},{time:"11:20 AM",msg:"WGN-SE4: Route deviation detected at Bilaspur",       color:"#ef4444"},{time:"11:10 AM",msg:"AI Engine: Maintenance forecast for SER updated",     color:"#3b82f6"},{time:"11:00 AM",msg:"WGN-SE1: Cargo overweight alert pending review",      color:"#f59e0b"},{time:"10:50 AM",msg:"Server SER: Auto-backup completed successfully",      color:"#22c55e"}],
  SWR: [{time:"10:45 AM",msg:"WGN-SW3: Engine anomaly detected at Hubballi",       color:"#ef4444"},{time:"10:20 AM",msg:"WGN-SW4: Route deviation near Belagavi",             color:"#ef4444"},{time:"10:10 AM",msg:"AI Engine: Fuel efficiency up 2.8% in Zone SWR",    color:"#3b82f6"},{time:"09:55 AM",msg:"WGN-SW1: Speed alert auto-resolved",                 color:"#22c55e"},{time:"09:40 AM",msg:"Server SWR: Auto-backup completed successfully",      color:"#22c55e"}],
};

export const ZONE_PREDICTIONS = {
  NR:  [{label:"Delay Prediction",value:78,color:"#f59e0b",detail:"9 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:65,color:"#ef4444",detail:"5 wagons need service in 7 days"},{label:"Fuel Efficiency",value:88,color:"#22c55e",detail:"Avg efficiency up 4.2% this week"},{label:"Route Optimisation",value:92,color:"#3b82f6",detail:"4 routes optimised by AI"}],
  SR:  [{label:"Delay Prediction",value:72,color:"#f59e0b",detail:"6 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:60,color:"#ef4444",detail:"3 wagons need service in 7 days"},{label:"Fuel Efficiency",value:85,color:"#22c55e",detail:"Avg efficiency up 3.1% this week"},{label:"Route Optimisation",value:89,color:"#3b82f6",detail:"3 routes optimised by AI"}],
  ER:  [{label:"Delay Prediction",value:74,color:"#f59e0b",detail:"7 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:63,color:"#ef4444",detail:"3 wagons need service in 7 days"},{label:"Fuel Efficiency",value:86,color:"#22c55e",detail:"Avg efficiency up 3.8% this week"},{label:"Route Optimisation",value:90,color:"#3b82f6",detail:"3 routes optimised by AI"}],
  WR:  [{label:"Delay Prediction",value:70,color:"#f59e0b",detail:"4 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:58,color:"#ef4444",detail:"3 wagons need service in 7 days"},{label:"Fuel Efficiency",value:91,color:"#22c55e",detail:"Avg efficiency up 5.0% this week"},{label:"Route Optimisation",value:93,color:"#3b82f6",detail:"2 routes optimised by AI"}],
  NER: [{label:"Delay Prediction",value:81,color:"#f59e0b",detail:"5 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:68,color:"#ef4444",detail:"2 wagons need service in 7 days"},{label:"Fuel Efficiency",value:79,color:"#22c55e",detail:"Avg efficiency up 1.9% this week"},{label:"Route Optimisation",value:84,color:"#3b82f6",detail:"2 routes optimised by AI"}],
  NWR: [{label:"Delay Prediction",value:75,color:"#f59e0b",detail:"5 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:62,color:"#ef4444",detail:"2 wagons need service in 7 days"},{label:"Fuel Efficiency",value:83,color:"#22c55e",detail:"Avg efficiency up 2.7% this week"},{label:"Route Optimisation",value:87,color:"#3b82f6",detail:"2 routes optimised by AI"}],
  SER: [{label:"Delay Prediction",value:73,color:"#f59e0b",detail:"5 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:61,color:"#ef4444",detail:"2 wagons need service in 7 days"},{label:"Fuel Efficiency",value:87,color:"#22c55e",detail:"Avg efficiency up 3.5% this week"},{label:"Route Optimisation",value:91,color:"#3b82f6",detail:"3 routes optimised by AI"}],
  SWR: [{label:"Delay Prediction",value:71,color:"#f59e0b",detail:"4 wagons likely delayed tomorrow"},{label:"Maintenance Forecast",value:59,color:"#ef4444",detail:"2 wagons need service in 7 days"},{label:"Fuel Efficiency",value:89,color:"#22c55e",detail:"Avg efficiency up 4.0% this week"},{label:"Route Optimisation",value:92,color:"#3b82f6",detail:"2 routes optimised by AI"}],
};

export const ZONE_HEALTH = {
  NR:  [{label:"GPS Active",val:"291",color:"#22c55e",pct:89},{label:"GPS Offline",val:"21",color:"#ef4444",pct:7},{label:"Stations Online",val:"38",color:"#3b82f6",pct:96},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"94%",color:"#22c55e",pct:94}],
  SR:  [{label:"GPS Active",val:"186",color:"#22c55e",pct:88},{label:"GPS Offline",val:"12",color:"#ef4444",pct:6},{label:"Stations Online",val:"24",color:"#3b82f6",pct:96},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"92%",color:"#22c55e",pct:92}],
  ER:  [{label:"GPS Active",val:"210",color:"#22c55e",pct:87},{label:"GPS Offline",val:"14",color:"#ef4444",pct:6},{label:"Stations Online",val:"28",color:"#3b82f6",pct:97},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"93%",color:"#22c55e",pct:93}],
  WR:  [{label:"GPS Active",val:"146",color:"#22c55e",pct:91},{label:"GPS Offline",val:"10",color:"#ef4444",pct:6},{label:"Stations Online",val:"19",color:"#3b82f6",pct:95},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"95%",color:"#22c55e",pct:95}],
  NER: [{label:"GPS Active",val:"88", color:"#22c55e",pct:84},{label:"GPS Offline",val:"10",color:"#ef4444",pct:10},{label:"Stations Online",val:"12",color:"#3b82f6",pct:92},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"88%",color:"#f59e0b",pct:88}],
  NWR: [{label:"GPS Active",val:"102",color:"#22c55e",pct:86},{label:"GPS Offline",val:"10",color:"#ef4444",pct:8},{label:"Stations Online",val:"14",color:"#3b82f6",pct:93},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"91%",color:"#22c55e",pct:91}],
  SER: [{label:"GPS Active",val:"133",color:"#22c55e",pct:88},{label:"GPS Offline",val:"10",color:"#ef4444",pct:7},{label:"Stations Online",val:"17",color:"#3b82f6",pct:94},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"92%",color:"#22c55e",pct:92}],
  SWR: [{label:"GPS Active",val:"118",color:"#22c55e",pct:90},{label:"GPS Offline",val:"9", color:"#ef4444",pct:7},{label:"Stations Online",val:"15",color:"#3b82f6",pct:94},{label:"Server Status",val:"OK",color:"#22c55e",pct:100},{label:"AI Engine",val:"Active",color:"#8b5cf6",pct:100},{label:"System Health",val:"93%",color:"#22c55e",pct:93}],
};
