
class ListPageView {
    constructor(storageService, viewModel) {
        this.storage = storageService;
        this.viewModel = viewModel;
        this.listTemplateHtml = "";
        this.wrapperTemplateHtml = "";
        this.searchWaiter = null;   //used to hold timeout instance for search
    }
    /* GETTERS AND SETTERS */
    get list() {
        return this.viewModel.list;
    }

    get view() { return this.viewModel; }                 //get viewModel as 'view'

    get wrapperTemplateUrl() { return this.view.wrapperTemplateUrl; }
    get $wrapperContainer() { return $("#" + this.view.wrapperContainerId); }

    get $listContainer() { return $("#" + this.view.listContainerId); }
    get listTemplateUrl() { return this.view.listTemplateUrl; }

    get columns() { return this.view.list.columns; }       //get columns needed for table

    get $alertContainer() { return $("#" + this.view.alertContainerId); }   //get jquery wrapped alert container for displaying alerts
    get $modal() { return $("#" + this.view.modalContainerId); }           //get jquery wrapped modal container

    get $headerIcon() { return $(`#${this.storage.sortCol}-${this.storage.sortDir}`) }

    reset() {
        this.storage.reset();
        this.render();
    }
    async render() {

        await this.renderWrapper();
        await this.renderList();
    }

    async renderWrapper() {
        this.$wrapperContainer.empty();
        if (!this.wrapperTemplateHtml.length > 0) {
            this.wrapperTemplateHtml = await this.getFileContents(this.wrapperTemplateUrl);
        }
        this.$wrapperContainer.html(ejs.render(this.wrapperTemplateHtml, { view: this.viewModel }));

        //bind events for Search, ClearSearch and ResetView 
        await this.bindWrapperEvents();
    }
    async renderList() {
        this.$listContainer.empty();
        this.data = await this.storage.list();

        if (!this.listTemplateHtml.length > 0) {
            this.listTemplateHtml = await this.getFileContents(this.listTemplateUrl);
        }
        this.$listContainer.html(ejs.render(this.listTemplateHtml, { view: this, data: this.data }));

        this.$headerIcon.show();    //show header icon for current sort col and direction (see getter)

        this.bindListEvents(this.data);
    }

    bindListEvents(data) {
        let that = this;


        this.view.list.columns.forEach((header) => {
            let $header = $(`#${header.name}`);
            $header.on("click", (ev) => {
                if (this.view.list.options.sortCol == header.name) {
                    if (this.view.list.options.sortDir == "asc") {
                        $(`${header.name}-asc`).css("display", "none");
                        $(`${header.name}-desc`).css("display", "inline");
                        this.view.list.options.sortDir = "desc";
                        this.storage.options = {
                            sortCol: `${header.name}`,
                            sortDir: "desc",
                            filterCol: "",
                            filterStr: ""
                        }
                    } else {
                        this.view.list.options.sortDir = "asc";
                        this.storage.options = {
                            sortCol: `${header.name}`,
                            sortDir: "asc",
                            filterCol: "",
                            filterStr: ""
                        }
                    }
                } else {
                    $(`${this.view.list.options.sortCol}-${this.view.list.options.sortDir}`)
                        .css("display", "none");
                    $(`${header.name}-asc`).css("display", "inline");
                    this.view.list.options.sortCol = `${header.name}`
                    this.view.list.options.sortDir = "asc";
                    this.storage.options = {
                        sortCol: `${header.name}`,
                        sortDir: "asc",
                        filterCol: "",
                        filterStr: ""
                    }
                }

                this.renderList();
            })
        })
        //initialize your popover code
        this.initPopover();
    }
    async bindWrapperEvents() {

        let that = this;
        let $myModal = this.$modal;


        $myModal.on("show.bs.modal", function (ev) {  //fired when modal is about to be shown

            var button = ev.relatedTarget
            var teamName = button.getAttribute('data-name');
            var teamId = button.getAttribute('data-id');
            $myModal.attr("data-name", teamName);
            $myModal.attr("data-id", teamId);


            var $modalTitle = $('.modal-title')
            var $modalBody = $('.modal-body')

            $modalTitle.text(`Delete ${teamName}?`);
            $modalBody.text(`Are you sure you want to delete ${teamName}? This action is unreversable.`)
        });

        $("#yesButton").click((e) => {    //fired when 'Yes' button is clicked
            let itemName = $myModal.attr("data-name");    //get item name and id from modal attribute set in show.bs.modal event
            let itemId = $myModal.attr("data-id");
            console.log(itemId);

            this.addAlert(this.view.entitySingle, itemName);   //insert an alert in 'alertContainer'

            this.deleteListItem(itemId)
                .then(this.renderList());

        })


        //'#resetView' button
        //'#searchInput button   NOTE: use the event called 'input' to trigger your search / REQUIRED
        //    this should grab the search value,  set this.storage.filterStr and re-render the list
        //'#clearSearch' button, this should clear search input, clear this.storage.filterStr, and rerender the list
        //IMPORTANT:  Since we rerender the list when we 'reset' you need to make sure that you turn off previously attached events
        //e.g.,   $('#resetView').off("click");
        $('#resetView').on("click", (e) => {
            this.reset();
        });
        $('#searchInput').on("input", (e) => {

            this.searchVal = $(e.target).val();
            this.runSearch();
        });

        $('#clearSearch').off("click").on("click", (e) => {
            $('#searchInput').val("");
            this.storage.filterStr = "";
            this.renderList();
        });
    }

    addAlert(itemType, itemName) {
        let alertHtml = `<div id="deleteAlert" class="alert alert-warning alert-dismissible fade show w-50" role="alert">
                            <strong>You deleted the following ${itemType}: ${itemName}</span>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
        this.$alertContainer.html(alertHtml);
    }
    runSearch() {
        clearTimeout(this.searchWaiter);
        this.searchWaiter = setTimeout(() => {
            if (this.searchVal.length > 1) {
                this.storage.filterStr = this.searchVal;
                this.storage.filterCol = this.storage.sortCol;
                this.renderList();

            }
        }, 250);
    }
    async deleteListItem(id) {
        await this.storage.delete(id);
        await this.renderList();
    }
    initPopover() {
        let that = this;
        $('[data-toggle="popover"]').popover({
            delay: { show: 500 }
        });

    }
    async getFileContents(url) {
        return await $.get(url);

    }
}