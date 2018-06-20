/*
 * Copyright 2017 Expedia, Inc.
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */
import tracesSearchStore from '../../../traces/stores/tracesSearchStore';

export class TracesTabStateStore {
    search = null;
    isAvailable = false;

    init(search) {
        // initialize observables using search object
        // check if for the given search context, tab is available
        this.search = search;

        // check all keys except time
        // eslint-disable-next-line no-unused-vars
        const {time, tabId, ...kv} =  search;
        this.isAvailable = !!Object.keys(kv).length;
    }

    fetch() {
        // TODO acting as a wrapper for older stores for now,
        // TODO fetch logic here
        const traceSearch = {
            traceId: this.search.traceId,
            timePreset: this.search.time.preset,
            startTime: this.search.time.from,
            endTime: this.search.time.to
        };

        if (this.search.serviceName) {
            traceSearch.serviceName = this.search.serviceName;
        }

        if (this.search.serviceName) {
            traceSearch.traceId = this.search.traceId;
        }

        tracesSearchStore.fetchSearchResults(traceSearch);

        return tracesSearchStore;
    }
}

export default new TracesTabStateStore();
