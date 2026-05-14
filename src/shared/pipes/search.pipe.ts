import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any[] | null | undefined, searchText: string): any[] {

    if(!value) return [];;
    if(!searchText) return value;
    
    const text = searchText.toLowerCase();

    return value.filter(item =>
      JSON.stringify(item).toLowerCase().includes(text)
    );
  }


}
