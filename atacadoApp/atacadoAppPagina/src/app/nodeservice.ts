import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TreeNode } from 'primeng/api';

@Injectable()
export class NodeService {

    constructor(private http: HttpClient) { }

    getFilesMenu() {
    return this.http.get<any>('assets/files_menu.json')
      .toPromise()
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      .then(res => <TreeNode[]> res.data);
    }
}
