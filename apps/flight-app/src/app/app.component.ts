import {Component} from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

@Component({
  selector: 'flight-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {

    const subj = new BehaviorSubject<string>('init');
    subj.next('A');
    subj.next('B');
    subj.next('C');
   
    subj.subscribe(x => console.log(x));

    subj.next('D');
    subj.next('E');

  }
}
