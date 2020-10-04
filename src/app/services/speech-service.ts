import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { timeout } from 'rxjs/operators';
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

@Injectable()
export class SpeechService {
  constructor(private zone: NgZone) { }
  recognition: SpeechRecognition;
  recognitionObs: Observable<string>;

  record(lang: string): Observable<string> {
    this.recognitionObs = Observable.create((observe) => {
      if (this.recognition) {
        this.stop();
      } else {
        this.recognition = new SpeechRecognition();
      }
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.onresult = (event) => {
        this.zone.run(() => {
          observe.next(event.results.item(event.results.length - 1).item(0).transcript);
        });
      };
      this.recognition.onerror = err => observe.error(err);
      this.recognition.onend = () => observe.complete();
      this.recognition.lang = lang;
      this.recognition.start();
    });
    this.recognitionObs.pipe(timeout(5000));
    return this.recognitionObs;
  }
  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

}
