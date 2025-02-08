'use strict';
document.addEventListener ('DOMContentLoaded', function () {
  setTimeout (function () {
    floatchart ();
  }, 500);
});
function floatchart () {
  (function () {
    var options1 = {
      chart: {type: 'bar', height: 50, sparkline: {enabled: true}},
      colors: ['#4680FF'],
      plotOptions: {bar: {borderRadius: 2, columnWidth: '80%'}},
      series: [
        {
          data: [10, 30, 40, 20, 60, 50, 20, 15, 20, 25, 30, 25],
        },
      ],
      xaxis: {crosshairs: {width: 1}},
      tooltip: {
        fixed: {enabled: false},
        x: {show: false},
        y: {
          title: {
            formatter: function (seriesName) {
              return '';
            },
          },
        },
        marker: {show: false},
      },
    };
    var chart = new ApexCharts (
      document.querySelector ('#all-earnings-graph'),
      options1
    );
    chart.render ();
    var options2 = {
      chart: {type: 'bar', height: 50, sparkline: {enabled: true}},
      colors: ['#E58A00'],
      plotOptions: {bar: {borderRadius: 2, columnWidth: '80%'}},
      series: [
        {
          data: [10, 30, 40, 20, 60, 50, 20, 15, 20, 25, 30, 25],
        },
      ],
      xaxis: {crosshairs: {width: 1}},
      tooltip: {
        fixed: {enabled: false},
        x: {show: false},
        y: {
          title: {
            formatter: function (seriesName) {
              return '';
            },
          },
        },
        marker: {show: false},
      },
    };
    var chart = new ApexCharts (
      document.querySelector ('#page-views-graph'),
      options2
    );
    chart.render ();
    var options3 = {
      chart: {type: 'bar', height: 50, sparkline: {enabled: true}},
      colors: ['#2CA87F'],
      plotOptions: {bar: {borderRadius: 2, columnWidth: '80%'}},
      series: [
        {
          data: [10, 30, 40, 20, 60, 50, 20, 15, 20, 25, 30, 25],
        },
      ],
      xaxis: {crosshairs: {width: 1}},
      tooltip: {
        fixed: {enabled: false},
        x: {show: false},
        y: {
          title: {
            formatter: function (seriesName) {
              return '';
            },
          },
        },
        marker: {show: false},
      },
    };
    var chart = new ApexCharts (
      document.querySelector ('#total-task-graph'),
      options3
    );
    chart.render ();
    var options4 = {
      chart: {type: 'bar', height: 50, sparkline: {enabled: true}},
      colors: ['#DC2626'],
      plotOptions: {bar: {borderRadius: 2, columnWidth: '80%'}},
      series: [
        {
          data: [10, 30, 40, 20, 60, 50, 20, 15, 20, 25, 30, 25],
        },
      ],
      xaxis: {crosshairs: {width: 1}},
      tooltip: {
        fixed: {enabled: false},
        x: {show: false},
        y: {
          title: {
            formatter: function (seriesName) {
              return '';
            },
          },
        },
        marker: {show: false},
      },
    };
    var chart = new ApexCharts (
      document.querySelector ('#download-graph'),
      options4
    );
    chart.render ();

    if (
      document.getElementById ('active_students_for_months') &&
      document.getElementById ('passive_students_for_months')
    ) {
      var activeStudentsData = JSON.parse (
        document.getElementById ('active_students_for_months').value || []
      );
      var passiveStudentsData = JSON.parse (
        document.getElementById ('passive_students_for_months').value || []
      );

      var activeStudentsArray = Object.values (activeStudentsData);
      var passiveStudentsArray = Object.values (passiveStudentsData);

      var options5 = {
        chart: {
          type: 'area',
          height: 230,
          toolbar: {
            show: false,
          },
        },
        colors: ['#0d6efd', '#ff4560'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            type: 'vertical',
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 1,
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            borderRadius: 4,
          },
        },
        grid: {
          strokeDashArray: 4,
        },
        series: [
          {
            name: 'Aktiv tələbələr', // İlk veri serisi
            data: activeStudentsArray,
          },
          {
            name: 'Passiv tələbələr', // İkinci veri serisi
            data: passiveStudentsArray,
          },
        ],
        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
      };
      var chart = new ApexCharts (
        document.querySelector ('#customer-rate-graph'),
        options5
      );
      chart.render ();
    }

    if (
      document.getElementById ('positive_exam_results') &&
      document.getElementById ('negative_exam_results')
    ) {
      // ExamResults
      var positive_exam_resultsData = JSON.parse (
        document.getElementById ('positive_exam_results').value || []
      );
      var negative_exam_resultsData = JSON.parse (
        document.getElementById ('negative_exam_results').value || []
      );

      var positive_exam_resultsDataArray = Object.values (
        positive_exam_resultsData
      );
      var negative_exam_resultsDataArray = Object.values (
        negative_exam_resultsData
      );

      var options912412 = {
        chart: {
          type: 'area',
          height: 230,
          toolbar: {
            show: false,
          },
        },
        colors: ['#ff4560', '#0d6efd'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            type: 'vertical',
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 1,
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            borderRadius: 4,
          },
        },
        grid: {
          strokeDashArray: 4,
        },
        series: [
          {
            name: 'Uğursuz imtahanlar',
            data: positive_exam_resultsDataArray,
          },
          {
            name: 'Uğurlu imtahanlar',
            data: negative_exam_resultsDataArray,
          },
        ],
      };
      var chart = new ApexCharts (
        document.querySelector ('#customer-rate-graph'),
        options912412
      );
      chart.render ();
    }
    var options6 = {
      chart: {
        type: 'area',
        height: 60,
        stacked: true,
        sparkline: {enabled: true},
      },
      colors: ['#4680FF'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
        },
      },
      stroke: {curve: 'smooth', width: 2},
      series: [{data: [5, 25, 3, 10, 4, 50, 0]}],
    };
    var chart = new ApexCharts (
      document.querySelector ('#total-tasks-graph'),
      options6
    );
    chart.render ();
    var options7 = {
      chart: {
        type: 'area',
        height: 60,
        stacked: true,
        sparkline: {enabled: true},
      },
      colors: ['#DC2626'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
        },
      },
      stroke: {curve: 'smooth', width: 2},
      series: [{data: [0, 50, 4, 10, 3, 25, 5]}],
    };
    var chart = new ApexCharts (
      document.querySelector ('#pending-tasks-graph'),
      options7
    );
    chart.render ();

    var options498 = {
      chart: {
        type: 'area',
        height: 60,
        stacked: true,
        sparkline: {enabled: true},
      },
      colors: ['#020202'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
        },
      },
      stroke: {curve: 'smooth', width: 2},
      series: [{data: [0, 50, 4, 10, 3, 25, 5]}],
    };

    var chart = new ApexCharts (
      document.querySelector ('#free-tasks-graph'),
      options498
    );
    chart.render ();

    if (document.getElementById ('array_category_values')) {
      var array_category_values = JSON.parse (
        document.getElementById ('array_category_values').value
      );
      var array_category_valuesArray = Object.values (array_category_values);

      var array_category_names = JSON.parse (
        document.getElementById ('array_category_names').value
      );
      var array_category_namesArray = Object.values (array_category_names);

      var options8 = {
        chart: {
          height: 320,
          type: 'donut',
        },
        series: array_category_valuesArray,
        colors: ['#4680FF', '#E58A00', '#2CA87F', '#4680FF'],
        labels: array_category_namesArray,
        fill: {
          opacity: [1, 1, 1, 0.3],
        },
        legend: {
          show: false,
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                name: {
                  show: true,
                },
                value: {
                  show: true,
                },
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        responsive: [
          {
            breakpoint: 575,
            options: {
              chart: {
                height: 250,
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '65%',
                    labels: {
                      show: false,
                    },
                  },
                },
              },
            },
          },
        ],
      };
      var chart = new ApexCharts (
        document.querySelector ('#total-income-graph'),
        options8
      );
      chart.render ();
    }
  }) ();
}
