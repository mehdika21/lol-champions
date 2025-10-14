import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummonerSpellsPageComponent } from './summoner-spells-page';

describe('SummonerSpellsPageComponent', () => {
  let component: SummonerSpellsPageComponent;
  let fixture: ComponentFixture<SummonerSpellsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummonerSpellsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummonerSpellsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
