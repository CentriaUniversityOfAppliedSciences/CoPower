// API
export interface APIOrganisationList { // Represents an organisation in the API response
  id: string;
  name: string;
}

export interface APIList {
  key: string;
  data: APIListObject;
  children: any;
}

export interface APIListObject { // Represents a list of organisations in the API response
  active: boolean;
  created: string;
  creator: string;
  id: string;
  lastUsed: string;
  organisation: string;
  organisationId: string;
}

// Organisation
export interface OrganisationList { // Represents a list of organisations
  key: string;
  data: OrganisationListData;
  children: any;
}

interface OrganisationListData { // Data structure for organisation list
  created: string;
  disabled: boolean;
  id: string;
  name: string;
  type: number | null;
  updated: string;
}

// Dashboard
/*
  status
  0 = initial
  1 = loading
  2 = error, measurement fetch failed
  3 = error, no access or not exist
  4 = error, no data measurement
  5 = ok
*/
export interface DashboardSensorObject // Represents a dashboard sensor object
{
  counter?: number;
  index?: number;
  name: string;
  sensors: DashboardSensorDataObject[];
  status: number;
}

export interface DashboardSensorDataObject { // Represents data for a dashboard sensor
  color: string;
  measurements: MeasurementDataObject[];
  name: string;
  sensor: string;
  type: string;
  unit: string;
}

export interface DashboardSensorSaveObject // Represents a dashboard sensor object
{
  name: string;
  sensors: DashboardSensorDataSaveObject[];
}

interface DashboardSensorDataSaveObject { // Represents data for a dashboard sensor
  color: string;
  name: string;
  sensor: string;
  type: string;
}

export interface MeasurementDataObject { // Represents a measurement data point
  x: number;
  y: number;
}
export interface MeasurementDataFormattedObject { // Represents a formatted measurement data point
  x: string;
  y: number;
}

export interface MeasurementObject { // Represents a measurement object
  measurements: MeasurementDataObject[];
  name: string;
  unit: string;
}

export interface MeasurementResponseObject {
  data: MeasurementDataObject[];
  error: boolean;
}

export interface PublicOrganisationData {
  id: string;
  name: string;
  sensors: SensorDetails[];
}

// HMI
export interface DashboardHMI
{
    name: string;
    sensors: HMISensorData[][];
}

/// <summary>
/// Sensor object associated with the dashboard.
/// </summary>
interface HMISensorData
{
    elementType: string;
    id: string;
    name: string;
    unit: string;
}

// Sensors
export interface SensorDetails { // Represents detailed information about a sensor
  id?: string;
  name: string;
  unit: string;
}

export interface SensorEditList { // Represents a list of sensors for editing
  color: number[];
  id: string;
  listName: string;
  name: string;
  unit: string;
}

export interface SensorsList { // Represents a list of sensors
  key: string;
  data: SensorsListData;
  children: any;
}

interface SensorsListData { // Data structure for sensor list
  id: string;
  name: string;
  type: string;
}

export interface SensorListSensor { // Represents a sensor in the sensor list
  data: SensorListSensorData;
  key: string;
}

export interface SensorListSensorData { // Data structure for a sensor in the sensor list
  created: string; // Creation date of the sensor
  deviceSource: string; // Device source of the sensor
  disabled: boolean; // Indicates if the sensor is disabled
  id: string; // Unique identifier for the sensor
  lastData: string | null; // Last data received from the sensor, null if no data or not available
  name: string; // Name of the sensor
  organisation: string; // Name of the organisation that owns the sensor
  organisationId: string; // Unique identifier for the organisation that owns the sensor
  shared: number; // Indicates if the sensor is shared (0 = not shared, 1 = shared with limited access, 2 = fully shared)
  source: string; // Source of the sensor data, typically a string representing the data source
  unit: string; // Unit of measurement for the sensor data
  updated: string | null; // Last update date of the sensor, null if not available
  valueChange: number; // Value divider for the sensor data, used to scale the sensor values if necessary
}

export interface SensorObject { // Represents a sensor object
  name: string;
  sensor: string;
  type: string;
}

export interface SensorObjectEdit { // Represents a sensor object for editing
  name: string;
  sensor: string;
  type: string;
}

// Users
export interface UsersList { // Represents a list of users' organisations
  key: string;
  data: UsersListOrganisationData;
  children: any;
}

interface UsersListOrganisationData { // Data structure for users' organisations
  id: string;
  name: string;
  type: string;
}

export interface UserListUser { // Represents a user in the user list
  data: UserListUserData;
  key: string;
}

interface UserListUserData { // Data structure for a user in the user list
  access: string;
  created: string;
  disabled: boolean;
  email: string;
  lastlogin: string;
  name: string;
  organisation: string;
  type: string;
  updated: string;
}