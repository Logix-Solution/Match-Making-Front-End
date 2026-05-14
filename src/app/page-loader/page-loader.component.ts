import { Component } from '@angular/core';
import { PageLoaderService } from 'src/shared/services/page-loader.service';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss']
})
export class PageLoaderComponent {

     isLoading = false;
   message = 'Loading...';

  constructor(private loader: PageLoaderService) {
    this.loader.loaderState.subscribe((state: any) => {
       setTimeout(() => {
      this.isLoading = state.show;
      this.message = state.message;
    });
  });
  }

}
