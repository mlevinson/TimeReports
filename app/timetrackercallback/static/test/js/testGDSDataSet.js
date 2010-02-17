function getTestGDSDataSet(){
    return {
                    "server_time":"1265822250",
                    "auth_user":{
                        "first_name":"Michael",
                        "last_name":"Levinson",
                        "id":"mlevinson",
                        "mail":"mlevinson@odesk.com",
                        "messenger_id":"73733861",
                        "messenger_type":"yahoo",
                        "timezone":"EET",
                        "timezone_offset":"7200"},
                        "table":{
                            "cols":[
                            {"type":"date","label":"worked_on"},
                            {"type":"number","label":"hours"},
                            {"type":"number","label":"charges"},
                            {"type":"string", "label":"team_name"},
                            {"type":"string", "label":"team_id"},
                            {"type":"string","label":"provider_name"},
                            {"type":"string","label":"provider_id"}
                            ],
                        "rows":[
                            {"c":[        {"v":"20100201"},   {"v":"8.34"}  ,    {"v":"108.34"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Michael Levinson"},         {"v":"mlevinson"}                                                          ]},
                            {"c":[        {"v":"20100201"},   {"v":"8.17"}  ,    {"v":"108.17"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Lakshmi Vyasarajan"},       {"v":"lakshmivyas"}                                                      ]},
                            {"c":[        {"v":"20100201"},   {"v":"5.83"}  ,    {"v":"105.83"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Miguel Guedes"},            {"v":"belnac"}                                                           ]},
                            {"c":[        {"v":"20100202"},   {"v":"6.33"}  ,    {"v":"106.33"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Michael Levinson"},         {"v":"mlevinson"}                                                        ]},
                            {"c":[        {"v":"20100202"},   {"v":"12.17"} ,    {"v":"1012.17"} ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Lakshmi Vyasarajan"},       {"v":"lakshmivyas"}                                                      ]},
                            {"c":[        {"v":"20100202"},   {"v":"0.83"}  ,    {"v":"100.83"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Miguel Guedes"},            {"v":"belnac"}                                                           ]},
                            {"c":[        {"v":"20100203"},   {"v":"10.00"}  ,    {"v":"106.83"}  ,    {"v":"oDesk"},    {"v":"oDesk"},             {"v":"Michael Levinson"},         {"v":"mlevinson"}                                                        ]},
                            {"c":[        {"v":"20100203"},   {"v":"9.00"}  ,    {"v":"109.16"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Lakshmi Vyasarajan"},       {"v":"lakshmivyas"}                                                         ]},
                            {"c":[        {"v":"20100203"},   {"v":"8.00"}  ,    {"v":"104.83"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Miguel Guedes"},            {"v":"belnac"}                                                              ]},
                            {"c":[        {"v":"20100204"},   {"v":"13.34"} ,    {"v":"1013.34"} ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Michael Levinson"},         {"v":"mlevinson"}                                                          ]},
                            {"c":[        {"v":"20100204"},   {"v":"8.84"}  ,    {"v":"108.84"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Lakshmi Vyasarajan"},       {"v":"lakshmivyas"}                                                         ]},
                            {"c":[        {"v":"20100204"},   {"v":"6.17"}  ,    {"v":"106.17"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Miguel Guedes"},            {"v":"belnac"}                                                              ]},
                            {"c":[        {"v":"20100205"},   {"v":"3.83"}  ,    {"v":"103.83"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Michael Levinson"},         {"v":"mlevinson"}                                                           ]},
                            {"c":[        {"v":"20100205"},   {"v":"8.67"}  ,    {"v":"108.67"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Lakshmi Vyasarajan"},       {"v":"lakshmivyas"}                                                         ]},
                            {"c":[        {"v":"20100205"},   {"v":"3.33"}  ,    {"v":"103.33"}  ,    {"v":"Product"},    {"v":"oProduct"},          {"v":"Miguel Guedes"},            {"v":"belnac"}                                                              ]}
                            ]
                            }
    };
}


function getGDSPivotedByWeekDaysOnProviderId(){

    var rows = 
            [
                ["belnac",               5.83,          0.83,     8.00,     6.17,     3.33,     0,     0  ],
                ["lakshmivyas",          8.17,          12.17,    9.00,     8.84,     8.67,     0,     0  ],
                ["mlevinson",             8.34,          6.33,     10.00,    13.34,    3.83,     0,     0  ]

            ];
     return rows;       

}