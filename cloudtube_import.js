(async () => {
    if (!document.getElementById('importFile')) {
        let importFileButton = document.createElement('input');
        importFileButton.type = 'file';
        importFileButton.accept = 'application/json';
        importFileButton.style.display = 'none';
        importFileButton.id = 'importFile';
        document.querySelector('main').appendChild(importFileButton);
    }
    
    if (!document.getElementById('import')) {
        let importButton = document.createElement('button');
        importButton.textContent = 'Import';
        importButton.id = 'import';
        importButton.style.marginTop = '25px';
        importButton.classList.add('border-look');
        document.querySelector('main').appendChild(importButton);
    }

    if (!document.getElementById('delete')) {
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.id = 'delete';
        deleteButton.style.marginTop = '25px';
        deleteButton.classList.add('border-look');
        document.querySelector('main').appendChild(deleteButton);
    }

    document.getElementById('import').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    
    document.getElementById('importFile').addEventListener('change', importOptions);

    document.getElementById('delete').addEventListener('click', () => {
        button = document.getElementById('delete');
        if (!button.disabled) deleteFilters(button);
    });

    function disableButton(button) {
        button.style.userSelect = 'none';
        button.style.color = '#999';
        button.style.cursor = 'default';
        button.style.backgroundColor = '#28282c';
        button.style.color = '#999';
    }

    function enableButton(button) {
        button.setAttribute('style', '');
    }
    
    async function populateFilters(obj) {
        let currentFilters = getFilters();
        let filtersToAdd = {
            'title': [],
            'channel-name': [],
            'channel-id': []
        }

        Object.keys(filtersToAdd).forEach((filterType) => {
            filtersToAdd[filterType] = obj[filterType].filter((filter) => {
                return !currentFilters[filterType].includes(filter);
            })
        })

        let requests = []

        Object.keys(filtersToAdd).forEach((filterType) => {
            requests.push(filtersToAdd[filterType].map((filter) => {
                return addFilter(filterType, filter);
            }))
        })

        await Promise.all(requests);
        location.reload();
    }
    
    function importOptions(evt) {
        const files = evt.target.files;
        const f = files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            let json;
            try {
                json = JSON.parse(e.target.result);
                let f = {}

                f['title'] = json.filterData.videoTitle.filter((e) => Boolean(e));
                f['channel-name'] = json.filterData.channelName.filter((e) => Boolean(e));
                f['channel-id'] = json.filterData.channelId.filter((e) => Boolean(e));

                populateFilters(f);
            } catch (ex) {
                alert('Invalid json');
            }
        };
        reader.readAsText(f);
    }

    function getFilters() {
        let filters = {
            'title': [],
            'channel-name': [],
            'channel-id': []
        };

        document.querySelectorAll('.filter').forEach((elem) => {
            let type = elem.querySelector('.filter__type').textContent.replace('type: ', '');
            let content = elem.querySelector('.filter__content').textContent;
            filters[type].push(content);
        })
        return filters;
    }

    async function deleteFilters(deleteButton) {
        deleteButton.disabled = true;
        disableButton(deleteButton);
        let requests = Array.from(document.querySelectorAll('input[name="delete-id"]')).map((elem) => {
            return post('filters/delete', `delete-id=${elem.value}`);
        })
        await Promise.all(requests);
        deleteButton.disabled = false;
        enableButton(deleteButton);
        location.reload();
    }

    function post(path, body) {
        return fetch(`https://tube.cadence.moe/${path}`, {
            method: 'POST',
            body: body
        })
    }

    function addFilter(filterType, filter) {
        post('filters', `filter-type=${filterType}&new-filter=${filter}`);
    }
})();