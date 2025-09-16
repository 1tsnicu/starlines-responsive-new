import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Bus } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

// Data structure for the timetable
interface TimetableStop {
  name: string;
  address: string;
  country: 'Ukraine' | 'Moldova';
  isBorderCrossing?: boolean;
}

interface TimetableSchedule {
  arrival?: string;
  stopDuration?: number;
  departure?: string;
  distanceFromStart?: number;
  distanceFromPrevious?: number;
}

interface TimetableData {
  stop: TimetableStop;
  direct: TimetableSchedule; // Kyiv → Chișinău
  reverse: TimetableSchedule; // Chișinău → Kyiv
}

const Timetable = () => {
  const { t } = useLocalization();

  // Helper function to get translated station name
  const getStationName = (originalName: string) => {
    const stationMap: { [key: string]: string } = {
      "Київ АС «Видубичі»": t('stations.kyivVydubychi'),
      "Київ АС «Київ»": t('stations.kyivCentral'),
      "Житомир": t('stations.zhytomyr'),
      "Бердичів АС": t('stations.berdychiv'),
      "Вінниця": t('stations.vinnytsia'),
      "Могилів-Подільський АС": t('stations.mohylivPodilskyi'),
      "АПП «Могилів-Подільський»": t('stations.mohylivBorderUkraine'),
      "АПП «Атаки»": t('stations.atakiBorderMoldova'),
      "Єдинці АС": t('stations.edinet'),
      "Бєльці АС": t('stations.balti'),
      "Оргєєв АС": t('stations.orhei'),
      "Кишинів АП": t('stations.chisinauBusPark'),
      "Кишинів АС": t('stations.chisinauCentral'),
    };
    return stationMap[originalName] || originalName;
  };

  // Helper function to get translated station address
  const getStationAddress = (originalName: string) => {
    const addressMap: { [key: string]: string } = {
      "Київ АС «Видубичі»": t('addresses.kyivVydubychi'),
      "Київ АС «Київ»": t('addresses.kyivCentral'),
      "Житомир": t('addresses.zhytomyr'),
      "Бердичів АС": t('addresses.berdychiv'),
      "Вінниця": t('addresses.vinnytsia'),
      "Могилів-Подільський АС": t('addresses.mohylivPodilskyi'),
      "Єдинці АС": t('addresses.edinet'),
      "Бєльці АС": t('addresses.balti'),
      "Оргєєв АС": t('addresses.orhei'),
      "Кишинів АП": t('addresses.chisinauBusPark'),
      "Кишинів АС": t('addresses.chisinauCentral'),
    };
    return addressMap[originalName] || '';
  };
  // Timetable data for Kyiv (Ukraine) – Chișinău (Republic of Moldova)
  const timetableData: TimetableData[] = [
    {
      stop: {
        name: "Київ АС «Видубичі»",
        address: "дорога Набережно-Печерська, 10А",
        country: "Ukraine"
      },
      direct: {
        departure: "21:00",
        distanceFromStart: 0
      },
      reverse: {
        arrival: "11:30",
        distanceFromPrevious: 12
      }
    },
    {
      stop: {
        name: "Київ АС «Київ»",
        address: "вул. С. Петлюри, 32",
        country: "Ukraine"
      },
      direct: {
        arrival: "21:30",
        stopDuration: 30,
        departure: "22:00",
        distanceFromStart: 12
      },
      reverse: {
        arrival: "11:00",
        stopDuration: 10,
        departure: "11:10",
        distanceFromPrevious: 136
      }
    },
    {
      stop: {
        name: "Житомир",
        address: "вул. Київська 93",
        country: "Ukraine"
      },
      direct: {
        arrival: "23:50",
        stopDuration: 10,
        departure: "00:00",
        distanceFromStart: 148
      },
      reverse: {
        arrival: "08:50",
        stopDuration: 10,
        departure: "09:00",
        distanceFromPrevious: 62
      }
    },
    {
      stop: {
        name: "Бердичів АС",
        address: "пл. Привокзальна 1-А",
        country: "Ukraine"
      },
      direct: {
        arrival: "00:55",
        stopDuration: 5,
        departure: "01:00",
        distanceFromStart: 210
      },
      reverse: {
        arrival: "07:50",
        stopDuration: 5,
        departure: "07:55",
        distanceFromPrevious: 86
      }
    },
    {
      stop: {
        name: "Вінниця",
        address: "вул. Київська, 8",
        country: "Ukraine"
      },
      direct: {
        arrival: "02:10",
        stopDuration: 10,
        departure: "02:20",
        distanceFromStart: 296
      },
      reverse: {
        arrival: "06:20",
        stopDuration: 10,
        departure: "06:30",
        distanceFromPrevious: 122
      }
    },
    {
      stop: {
        name: "Могилів-Подільський АС",
        address: "вул. Пушкінська 41",
        country: "Ukraine"
      },
      direct: {
        arrival: "04:15",
        stopDuration: 5,
        departure: "04:20",
        distanceFromStart: 418
      },
      reverse: {
        arrival: "04:15",
        stopDuration: 10,
        departure: "04:25",
        distanceFromPrevious: 2
      }
    },
    {
      stop: {
        name: "АПП «Могилів-Подільський»",
        address: "",
        country: "Ukraine",
        isBorderCrossing: true
      },
      direct: {
        arrival: "04:30",
        stopDuration: 30,
        departure: "05:00",
        distanceFromStart: 420
      },
      reverse: {
        arrival: "03:35",
        stopDuration: 30,
        departure: "04:05",
        distanceFromPrevious: 1
      }
    },
    {
      stop: {
        name: "АПП «Атаки»",
        address: "",
        country: "Moldova",
        isBorderCrossing: true
      },
      direct: {
        arrival: "05:05",
        stopDuration: 30,
        departure: "05:35",
        distanceFromStart: 421
      },
      reverse: {
        arrival: "03:00",
        stopDuration: 30,
        departure: "03:30",
        distanceFromPrevious: 56
      }
    },
    {
      stop: {
        name: "Єдинці АС",
        address: "вул. Индепенденцей, 227",
        country: "Moldova"
      },
      direct: {
        arrival: "06:30",
        stopDuration: 5,
        departure: "06:35",
        distanceFromStart: 477
      },
      reverse: {
        arrival: "01:50",
        stopDuration: 5,
        departure: "01:55",
        distanceFromPrevious: 71
      }
    },
    {
      stop: {
        name: "Бєльці АС",
        address: "вул. Штефана Великого, 2",
        country: "Moldova"
      },
      direct: {
        arrival: "07:40",
        stopDuration: 5,
        departure: "07:45",
        distanceFromStart: 548
      },
      reverse: {
        arrival: "00:40",
        stopDuration: 5,
        departure: "00:45",
        distanceFromPrevious: 86
      }
    },
    {
      stop: {
        name: "Оргєєв АС",
        address: "ул. Садовяну, 50",
        country: "Moldova"
      },
      direct: {
        arrival: "09:00",
        stopDuration: 5,
        departure: "09:05",
        distanceFromStart: 634
      },
      reverse: {
        arrival: "23:20",
        stopDuration: 5,
        departure: "23:25",
        distanceFromPrevious: 59
      }
    },
    {
      stop: {
        name: "Кишинів АП",
        address: "Bulevardul Dacia 80/3",
        country: "Moldova"
      },
      direct: {
        arrival: "10:05",
        stopDuration: 10,
        departure: "10:15",
        distanceFromStart: 693
      },
      reverse: {
        arrival: "22:05",
        stopDuration: 15,
        departure: "22:20",
        distanceFromPrevious: 13
      }
    },
    {
      stop: {
        name: "Кишинів АС",
        address: "вул. Каля Мошилор, 2/1",
        country: "Moldova"
      },
      direct: {
        arrival: "10:30",
        distanceFromStart: 706
      },
      reverse: {
        arrival: "21:15",
        stopDuration: 30,
        departure: "21:45"
      }
    }
  ];

  const formatTime = (time?: string) => time || "-";
  const formatDuration = (duration?: number) => duration ? `${duration} ${t('timetable.minutes')}` : "-";
  const formatDistance = (distance?: number) => distance !== undefined ? `${distance} ${t('timetable.kilometers')}` : "-";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-6 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('timetable.scheduleTitle')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('timetable.busSchedule')}
            </p>
            <p className="text-foreground font-semibold text-xl mt-2">
              {t('timetable.routeTitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6 px-4">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.arrivalTime')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.stopDuration')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.departureTime')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.distanceFromStart')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm bg-blue-50">
                      {t('timetable.stopNames')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.distanceBetweenStops')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.arrivalTime')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.stopDuration')}
                    </th>
                    <th className="border border-border p-3 text-left font-semibold text-sm">
                      {t('timetable.departureTime')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timetableData.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      {/* Direct direction columns (Kyiv → Chișinău) */}
                      <td className="border border-border p-3 text-sm text-center">
                        {formatTime(row.direct.arrival)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatDuration(row.direct.stopDuration)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatTime(row.direct.departure)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatDistance(row.direct.distanceFromStart)}
                      </td>
                      
                      {/* Stop name column */}
                      <td className="border border-border p-3 text-sm bg-blue-50">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{getStationName(row.stop.name)}</div>
                            {row.stop.address && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {getStationAddress(row.stop.name)}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Badge 
                                variant={row.stop.country === 'Ukraine' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {row.stop.country === 'Ukraine' ? 'Ukraine' : 'Moldova'}
                              </Badge>
                              {row.stop.isBorderCrossing && (
                                <Badge variant="outline" className="text-xs">
                                  {t('timetable.borderCrossing')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Reverse direction columns (Chișinău → Kyiv) */}
                      <td className="border border-border p-3 text-sm text-center">
                        {formatDistance(row.reverse.distanceFromPrevious)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatTime(row.reverse.arrival)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatDuration(row.reverse.stopDuration)}
                      </td>
                      <td className="border border-border p-3 text-sm text-center">
                        {formatTime(row.reverse.departure)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bus className="h-5 w-5" />
                {t('timetable.directDirection')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('timetable.directRoute')}
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div>• <strong>{t('timetable.arrivalTime')}</strong> - {t('timetable.arrivalTimeDesc')}</div>
                <div>• <strong>{t('timetable.stopDuration')}</strong> - {t('timetable.stopDurationDesc')}</div>
                <div>• <strong>{t('timetable.departureTime')}</strong> - {t('timetable.departureTimeDesc')}</div>
                <div>• <strong>{t('timetable.distanceFromStart')}</strong> - {t('timetable.distanceFromStartDesc')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('timetable.reverseDirection')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('timetable.reverseRoute')}
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div>• <strong>{t('timetable.distanceBetweenStops')}</strong> - {t('timetable.distanceBetweenDesc')}</div>
                <div>• <strong>{t('timetable.arrivalTime')}</strong> - {t('timetable.arrivalTimeDesc')}</div>
                <div>• <strong>{t('timetable.stopDuration')}</strong> - {t('timetable.stopDurationDesc')}</div>
                <div>• <strong>{t('timetable.departureTime')}</strong> - {t('timetable.departureTimeDesc')}</div>
              </div>
            </CardContent>
          </Card>
              </div>

        {/* Additional Info */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{t('timetable.importantInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>АПП</strong> - {t('timetable.borderCrossing')}
                </div>
                <div>
                  <strong>АС</strong> - {t('timetable.busStation')}
                </div>
                <div>
                  <strong>АП</strong> - {t('timetable.busPark')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;
