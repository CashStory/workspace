/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

/**
 * Search component service, connects your code to a page-level search component.
 */
@Injectable()
export class NgxSearchService {
  private searchSubmittings$ = new Subject<{ term: string, suggestion?: string }>();
  private searchActivations$ = new Subject<{ searchType: string, suggestion?: string }>();
  private searchDeactivations$ = new Subject<{ searchType: string, suggestion?: string }>();
  private searchInput$ = new Subject<{ term: string, suggestion?: string }>();

  /***
   * Activate (open) search component
   * @param {string} searchType
   * @param {string} suggestion
   */
  activateSearch(searchType: string, suggestion?: string) {
    this.searchActivations$.next({ searchType, suggestion });
  }

  /**
   * Deactibate (close) search component
   * @param {string} searchType
   * @param {string} suggestion
   */
  deactivateSearch(searchType: string, suggestion?: string) {
    this.searchDeactivations$.next({ searchType, suggestion });
  }

  /**
   * Trigger search submit
   * @param {string} term
   * @param {string} suggestion
   */
  submitSearch(term: string, suggestion?: string) {
    this.searchSubmittings$.next({ term, suggestion });
  }

  /**
   * Trigger search submit by input event
   * @param {string} term
   * @param {string} suggestion
   */
  searchInput(term: string, suggestion?: string) {
    this.searchInput$.next({ term, suggestion });
  }

  /**
   * Subscribe to 'activate' event
   * @returns Observable<{searchType: string; suggestion?: string}>
   */
  onSearchActivate(): Observable<{ searchType: string, suggestion?: string }> {
    return this.searchActivations$.pipe(share());
  }

  /**
   * Subscribe to 'deactivate' event
   * @returns Observable<{searchType: string; suggestion?: string}>
   */
  onSearchDeactivate(): Observable<{ searchType: string, suggestion?: string }> {
    return this.searchDeactivations$.pipe(share());
  }

  /**
   * Subscribe to 'submit' event (when submit button clicked)
   * @returns Observable<{term: string; suggestion?: string}>
   */
  onSearchSubmit(): Observable<{ term: string, suggestion?: string }> {
    return this.searchSubmittings$.pipe(share());
  }

  /**
   * Subscribe to input event
   * @returns Observable<{term: string; suggestion?: string}>
   */
  onSearchInput(): Observable<{ term: string, suggestion?: string }> {
    return this.searchInput$.pipe(share());
  }
}
