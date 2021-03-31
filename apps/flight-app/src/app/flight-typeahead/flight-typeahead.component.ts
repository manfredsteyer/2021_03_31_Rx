import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight, FlightService } from '@flight-workspace/flight-lib';
import { combineLatest, interval, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, delay, distinctUntilChanged, exhaustMap, filter, map, mergeMap, share, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'flight-workspace-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent implements OnInit, OnDestroy {

  // Marble-Testing
  // Input: ----a----b-----
  //          { a: 7, b: 20 }
  // Aktion: map(x => 10 * x)
  // Assert: ----x----y-----
  //  {x: 70, y: 200}

  input$: Observable<string>;
  flights$: Observable<Flight[]>;

  close$ = new Subject<void>();

  online$: Observable<boolean>;
  // online: boolean;

  control: FormControl;

  constructor(private flightService: FlightService) { }
  
  ngOnDestroy(): void {
    this.close$.next();
  }

  ngOnInit(): void {

    this.control = new FormControl();
    this.input$ = this.control.valueChanges.pipe(
      filter(v => v.length >= 3),
      debounceTime(300),
    );

    this.online$ = interval(2000).pipe( // ..0..1..2..3
      startWith(-1), // -1..0..1..2..3
      tap(v => console.log(v)), 
      map(() => Math.random() < 0.5), // t, t, t, f, f, t
      map(() => true),
      distinctUntilChanged(), // t, f, t
      // shared()
      shareReplay({bufferSize: 1, refCount: true}),
      // shareReplay(1)
      // tap(value => this.online = value)
    );

    this.online$.pipe(takeUntil(this.close$)).subscribe();
 


    this.flights$ = combineLatest([this.input$, this.online$]).pipe(
      // filter(t => t[1])
      filter( ([, online]) => online),
      map( ([value, ]) => value),
      switchMap(v => this.load(v)),
    );

    // this.input$.pipe(
    //   debounceTime(300),
    //   switchMap(v => this.flightService.find(v, ''))
    // );
  }

  load(filter: string): Observable<Flight[]> {
    return this.flightService.find(filter, '').pipe(
      catchError(err => {
        console.error('err', err);
        return of([]);
      })
    );
  }


}
