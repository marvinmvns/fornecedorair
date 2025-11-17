import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BaseChartDirective
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ]
})
export class DashboardModule { }
