
var teamViewModel = {
    entity: "teams",           //key used for LocalStorage
    entitySingle: "team",      //singular in case you need for alert message
    wrapperContainerId: "teamPageWrapper",
    wrapperTemplateUrl: "js/views/partials/list_page_wrapper.ejs",
    listContainerId: "tableContainer",
    listTemplateUrl: "js/views/partials/list_view.ejs",
    modalContainerId: "myModal",
    alertContainerId: "alertContainer",   //container to store dismissible alert
    data: mockTeamData,          //mock data we are going to use for now, global (included from js/models/mock_team_data.js)
    list: {
        options: {                 //default options sent to LocalStorageService
            sortCol: "name",
            sortDir: "asc",
            limit: "",
            offset: "",
            filterCol: "",
            filterStr: ""
        },
        listTitle: "Teams",

        id: "my-list",
        tableClasses: "table table-dark table-hover mt-2",   //classes for table tag
        thClasses: "bg-black bg-gradient",                    //classes for my th tags (you may not need)

        logoCol: "teamPhoto",                                //what data column holds the path to the team logo (if used in your code)
        nameCol: "name",                                     //what data column do we use to display the item 'name'
        /*Columns to be displayed in your bootstrap table.  I used 'popover=true' to indicate I wanted to include that colum in my popover.
        This allowed me to keep my code 'generic'*/
        columns: [
            {
                label: "Team Name",
                name: "name",
                popover: "true"            //true if you want to show in popover
            },
            {
                label: "Coach Name",
                name: "coachName",
                popover: "true"
            },
            {
                label: "Coach Phone",
                name: "coachPhone",
                popover: "true"
            }
        ]
    }


}
