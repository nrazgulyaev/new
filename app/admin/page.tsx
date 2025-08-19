'use client'
import * as React from 'react'
import { Admin, Resource, List, Datagrid, TextField, NumberField, Edit, SimpleForm, TextInput, NumberInput, Create, DateField, DateInput, SelectInput } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

const dataProvider = simpleRestProvider('/api/v1')

// Projects
const ProjectList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
)

const ProjectEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="description" />
    </SimpleForm>
  </Edit>
)

const ProjectCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
)

// Villas
const statusChoices = [
  { id: 'available', name: 'available' },
  { id: 'reserved', name: 'reserved' },
  { id: 'sold', name: 'sold' }
]

const VillaList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <NumberField source="projectId" />
      <TextField source="name" />
      <TextField source="villaType" />
      <NumberField source="rooms" />
      <NumberField source="landSqm" />
      <NumberField source="villaSqm" />
      <NumberField source="pricePerSqm" />
      <NumberField source="basePrice" />
      <NumberField source="priceWithVat" />
      <TextField source="status" />
    </Datagrid>
  </List>
)

const VillaEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput source="projectId" />
      <TextInput source="name" />
      <TextInput source="villaType" />
      <NumberInput source="rooms" />
      <NumberInput source="landSqm" />
      <NumberInput source="villaSqm" />
      <NumberInput source="floor1Sqm" />
      <NumberInput source="floor2Sqm" />
      <NumberInput source="rooftopSqm" />
      <NumberInput source="gardenPoolSqm" />
      <NumberInput source="pricePerSqm" />
      <NumberInput source="basePrice" />
      <NumberInput source="vatRate" />
      <NumberInput source="priceWithVat" />
      <NumberInput source="firstPayment" />
      <SelectInput source="status" choices={statusChoices} />
      <NumberInput source="areaSqm" />
      <NumberInput source="monthlyPriceGrowthPct" />
      <DateInput source="leaseholdEndDate" />
      <NumberInput source="dailyRateUSD" />
      <NumberInput source="rentalGrowthPct" />
      <NumberInput source="occupancyPct" />
    </SimpleForm>
  </Edit>
)

const VillaCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <NumberInput source="projectId" required />
      <TextInput source="name" required />
      <TextInput source="villaType" required />
      <NumberInput source="rooms" required />
      <NumberInput source="landSqm" required />
      <NumberInput source="villaSqm" required />
      <NumberInput source="floor1Sqm" />
      <NumberInput source="floor2Sqm" />
      <NumberInput source="rooftopSqm" />
      <NumberInput source="gardenPoolSqm" />
      <NumberInput source="pricePerSqm" required />
      <NumberInput source="basePrice" required />
      <NumberInput source="vatRate" defaultValue={0.11} />
      <NumberInput source="priceWithVat" />
      <NumberInput source="firstPayment" />
      <SelectInput source="status" choices={statusChoices} defaultValue={'available'} />
      <NumberInput source="areaSqm" />
      <NumberInput source="monthlyPriceGrowthPct" />
      <DateInput source="leaseholdEndDate" />
      <NumberInput source="dailyRateUSD" />
      <NumberInput source="rentalGrowthPct" />
      <NumberInput source="occupancyPct" />
    </SimpleForm>
  </Create>
)

// Scenarios
const ScenarioList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="villaId" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
)

const ScenarioEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <NumberInput source="villaId" />
    </SimpleForm>
  </Edit>
)

const ScenarioCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <NumberInput source="villaId" />
    </SimpleForm>
  </Create>
)

export default function AdminApp() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="projects" list={ProjectList} edit={ProjectEdit} create={ProjectCreate} />
      <Resource name="villas" list={VillaList} edit={VillaEdit} create={VillaCreate} />
      <Resource name="scenarios" list={ScenarioList} edit={ScenarioEdit} create={ScenarioCreate} />
    </Admin>
  )
}