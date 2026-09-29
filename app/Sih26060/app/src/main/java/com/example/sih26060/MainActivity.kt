
package com.example.sih26060



import android.os.Bundle
import android.graphics.Paint
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt


// ============================================================
// ACTIVITY
// ============================================================

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = android.graphics.Color.rgb(8, 29, 42)
        window.navigationBarColor = android.graphics.Color.rgb(8, 29, 42)
        window.decorView.systemUiVisibility = 0

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Teal,
                    secondary = Gold,
                    background = Background,
                    surface = Card,
                    onPrimary = Color.White,
                    onSecondary = Color(0xFF081D2A),
                    onBackground = DarkText,
                    onSurface = DarkText,
                    onSurfaceVariant = Secondary
                )
            ) {
                AntarcticApp()
            }
        }
    }
}


// ============================================================
// COLORS
// ============================================================

private val Background = Color(0xFF081D2A)
private val Card = Color(0xFF102D3E)
private val DarkTeal = Color(0xFF163B4D)
private val TextTeal = Color(0xFF8ED3D9)
private val Teal = Color(0xFF2DB7C4)
private val DarkText = Color(0xFFE8F1F4)
private val Secondary = Color(0xFF8DA3AE)
private val Border = Color(0xFF294857)
private val Green = Color(0xFF4DB88A)
private val Gold = Color(0xFFD9A33A)
private val Purple = Color(0xFF9A88C2)
private val Red = Color(0xFFE2767C)
private val Blue = Color(0xFF4FABB9)


// ============================================================
// STATION DATA
// ============================================================

data class Station(
    val name: String,
    val id: String,
    val coordinates: String,
    val location: String,
    val description: String,
    val capacity: String,
    val elevation: String,
    val established: String,

    val temperature: String,
    val pressure: String,
    val wind: String,

    val generation: String,
    val consumption: String,
    val diesel: String,

    val food: String,
    val dieselAutonomy: String,

    val forecastDiesel: Float,
    val forecastFood: Float
)

private val Maitri = Station(
    name = "Maitri",
    id = "MAITRI",
    coordinates = "70°45′57″ S, 11°44′09″ E",
    location = "Schirmacher Oasis, Queen Maud Land",
    description =
        "India's second Antarctic research station on the Schirmacher Oasis, supporting year-round scientific research and serving as a gateway to the mountains of central Dronning Maud Land.",
    capacity = "25 personnel",
    elevation = "≈50 m",
    established = "1988",

    temperature = "2.6",
    pressure = "978.8",
    wind = "17.1",

    generation = "137.8",
    consumption = "120.8",
    diesel = "60.6",

    food = "67.9",
    dieselAutonomy = "42.3",

    forecastDiesel = 42.1f,
    forecastFood = 68.0f
)

private val Bharati = Station(
    name = "Bharati",
    id = "BHARATI",
    coordinates = "69°24′00″ S, 76°11′00″ E",
    location = "Larsemann Hills, Princess Elizabeth Land",
    description =
        "India's Antarctic research station supporting polar science, atmospheric observations and logistics across the eastern Antarctic sector.",
    capacity = "47 personnel",
    elevation = "≈34 m",
    established = "2012",

    temperature = "-8.4",
    pressure = "1004.2",
    wind = "12.7",

    generation = "121.4",
    consumption = "106.3",
    diesel = "74.2",

    food = "81.5",
    dieselAutonomy = "51.8",

    forecastDiesel = 51.2f,
    forecastFood = 81.5f
)


// ============================================================
// NAVIGATION
// ============================================================

enum class Tab {
    OVERVIEW,
    ASSETS,
    WHAT_IF,
    FORECAST
}

private val tabs = listOf(
    Tab.OVERVIEW,
    Tab.ASSETS,
    Tab.WHAT_IF,
    Tab.FORECAST
)

private fun Tab.title(): String =
    when (this) {
        Tab.OVERVIEW -> "Overview"
        Tab.ASSETS -> "Assets"
        Tab.WHAT_IF -> "What-If"
        Tab.FORECAST -> "Forecast"
    }

private fun Tab.icon(): ImageVector =
    when (this) {
        Tab.OVERVIEW -> Icons.Outlined.GridView
        Tab.ASSETS -> Icons.Outlined.Inventory2
        Tab.WHAT_IF -> Icons.Outlined.AutoGraph
        Tab.FORECAST -> Icons.Outlined.Timeline
    }


// ============================================================
// APP
// ============================================================

@Composable
private fun AntarcticApp() {

    var selectedTab by rememberSaveable {
        mutableStateOf(Tab.OVERVIEW)
    }

    var stationName by rememberSaveable {
        mutableStateOf("Maitri")
    }

    val station =
        if (stationName == "Maitri")
            Maitri
        else
            Bharati

    /*var currentUtcTime by remember {
        mutableStateOf(
            ZonedDateTime.now(ZoneOffset.UTC)
                .format(
                    DateTimeFormatter.ofPattern("HH:mm:ss")
                )
        )
    }

    LaunchedEffect(Unit) {

        while (true) {

            currentUtcTime =
                ZonedDateTime.now(ZoneOffset.UTC)
                    .format(
                        DateTimeFormatter.ofPattern("HH:mm:ss")
                    )

            delay(1000)
        }
    }*/
    val currentUtcTime = "15:53"

    Scaffold(
        containerColor = Background,

        topBar = {

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    //.background(Color(0xFF102D3E))
                    .background(Color(0xFF102D3E))
            ) {

                TopAppBar(
                    currentUtcTime = currentUtcTime,
                )

                StationSelector(
                    stationName = stationName,
                    onStationSelected = {
                        stationName = it
                    }
                )
            }
        },

        bottomBar = {

            BottomNavigationBar(
                selectedTab = selectedTab,
                onTabSelected = {
                    selectedTab = it
                }
            )
        }
    ) { innerPadding ->

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {

            when (selectedTab) {

                Tab.OVERVIEW ->
                    OverviewScreen(station)

                Tab.ASSETS ->
                    AssetsScreen(station)

                Tab.WHAT_IF ->
                    WhatIfScreen(station)

                Tab.FORECAST ->
                    ForecastScreen(station)
            }
        }
    }
}


// ============================================================
// TOP APP BAR
// ============================================================

@Composable
private fun TopAppBar(
    currentUtcTime: String
) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .height(64.dp)
            //.background(Color(0xFF102D3E))
            .padding(horizontal = 16.dp)
        ,
        verticalAlignment = Alignment.CenterVertically
    ) {

        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(Color(0xFF173B4D))
            ,
            contentAlignment = Alignment.Center
        ) {

            Icon(
                Icons.Outlined.SatelliteAlt,
                contentDescription = null,
                tint = TextTeal
            )
        }

        Spacer(Modifier.width(10.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {

            Text(
                "Antarctic Remote Operations",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                "Research Command Center",
                fontSize = 12.sp,
                color = Secondary
            )
        }

        Column(
            horizontalAlignment = Alignment.End
        ) {

            Text(
                "UTC",
                fontSize = 11.sp,
                color = Secondary
            )

            Text(
                currentUtcTime,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText
            )
        }
    }
}


// ============================================================
// STATION SELECTOR
// ============================================================

@Composable
private fun StationSelector(
    stationName: String,
    onStationSelected: (String) -> Unit
) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                horizontal = 14.dp,
                vertical = 7.dp
            )
            .clip(RoundedCornerShape(13.dp))
            .background(Color(0xFF102A3A))
            .padding(4.dp),
        horizontalArrangement = Arrangement.Center
    ) {

        StationButton(
            text = "Maitri",
            selected = stationName == "Maitri"
        ) {
            onStationSelected("Maitri")
        }

        StationButton(
            text = "Bharati",
            selected = stationName == "Bharati"
        ) {
            onStationSelected("Bharati")
        }
    }
}

@Composable
private fun StationButton(
    text: String,
    selected: Boolean,
    onClick: () -> Unit
) {

    Box(
        modifier = Modifier
            .width(125.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(
                if (selected)
                    DarkTeal
                else
                    Color.Transparent
            )
            .clickable(onClick = onClick)
            .padding(
                vertical = 10.dp
            ),
        contentAlignment = Alignment.Center
    ) {

        Text(
            text,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color =
                if (selected)
                    Color.White
                else
                    Secondary
        )
    }
}


// ============================================================
// BOTTOM NAVIGATION
// ============================================================

@Composable
private fun BottomNavigationBar(
    selectedTab: Tab,
    onTabSelected: (Tab) -> Unit
) {

    NavigationBar(
        containerColor = Color(0xFF102D3E),
        tonalElevation = 5.dp
    ) {

        tabs.forEach { tab ->

            NavigationBarItem(
                selected = selectedTab == tab,

                onClick = {
                    onTabSelected(tab)
                },

                icon = {
                    Icon(
                        tab.icon(),
                        contentDescription = tab.title()
                    )
                },

                label = {
                    Text(
                        tab.title(),
                        fontSize = 11.sp
                    )
                },

                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = TextTeal,
                    selectedTextColor = TextTeal,
                    indicatorColor = Color(0xFF214758),
                    unselectedIconColor = Secondary,
                    unselectedTextColor = Secondary
                )
            )
        }
    }
}


// ============================================================
// OVERVIEW
// ============================================================

@Composable
private fun OverviewScreen(
    station: Station
) {

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

        item {
            StationHero(station)
        }

        item {

            OverviewSection(
                title = "Atmospheric & Environmental Telemetry",
                subtitle = "Current environmental conditions",
                icon = Icons.Outlined.Cloud
            ) {

                MetricCard(
                    "TEMPERATURE",
                    station.temperature,
                    "°C",
                    Icons.Outlined.Thermostat,
                    Teal
                )

                MetricCard(
                    "ATMOSPHERIC PRESSURE",
                    station.pressure,
                    "hPa",
                    Icons.Outlined.Speed,
                    Purple
                )

                MetricCard(
                    "WIND VELOCITY",
                    station.wind,
                    "m/s",
                    Icons.Outlined.Air,
                    Green
                )
            }
        }

        item {

            OverviewSection(
                title = "Power Microgrid & Energy Generation",
                subtitle = "Station power, consumption & reserve telemetry",
                icon = Icons.Outlined.Bolt
            ) {

                MetricCard(
                    "POWER GENERATION",
                    station.generation,
                    "kW",
                    Icons.Outlined.Bolt,
                    Gold,
                    "Simulated"
                )

                MetricCard(
                    "POWER CONSUMPTION",
                    station.consumption,
                    "kW",
                    Icons.Outlined.ShowChart,
                    Teal,
                    "Simulated"
                )

                MetricCard(
                    "DIESEL FUEL LEVEL",
                    station.diesel,
                    "%",
                    Icons.Outlined.LocalGasStation,
                    Green,
                    "Simulated"
                )
            }
        }

        item {

            OverviewSection(
                title = "Logistics & Autonomous Reserves",
                subtitle = "Supplies, fuel autonomy & critical inventory",
                icon = Icons.Outlined.Inventory2
            ) {

                MetricCard(
                    "FOOD RATIONS RESERVE",
                    station.food,
                    "days",
                    Icons.Outlined.Restaurant,
                    Purple,
                    "Simulated"
                )

                MetricCard(
                    "DIESEL AUTONOMY",
                    station.dieselAutonomy,
                    "days",
                    Icons.Outlined.LocalGasStation,
                    Teal,
                    "Simulated"
                )

                StatusCard(
                    "MEDICAL & CRITICAL SPARES",
                    "Nominal",
                    Green
                )
            }
        }

        item {
            Spacer(Modifier.height(20.dp))
        }
    }
}


// ============================================================
// STATION HERO WITH BACKGROUND IMAGE
// ============================================================

@Composable
private fun StationHero(
    station: Station
) {

    val imageRes =
        if (station.name == "Maitri")
            R.drawable.maitri
        else
            R.drawable.bharati

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
    ) {

        Image(
            painter = painterResource(imageRes),
            contentDescription = "${station.name} research station",
            modifier = Modifier
                .fillMaxWidth()
                .height(390.dp),
            contentScale = ContentScale.Crop,
            alignment = Alignment.BottomCenter
        )

        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0x44000000),
                            Color(0xD10C2431),
                            Color(0xF50A202D)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .height(390.dp)
                .padding(18.dp)
        ) {

            Text(
                "•  INDIAN ANTARCTIC PROGRAMME",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = .8.sp,
                color = TextTeal,
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF3A3325))
                    .padding(
                        horizontal = 9.dp,
                        vertical = 6.dp
                    )
            )

            Spacer(Modifier.height(14.dp))

            Row {

                HeroPill(
                    "STATION ID: ${station.id}"
                )

                Spacer(Modifier.width(6.dp))

                HeroPill(
                    "• Operational"
                )
            }

            Spacer(Modifier.height(9.dp))

            Text(
                station.name,
                fontSize = 34.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                "Research Station",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF7ED7E0)
            )

            Spacer(Modifier.height(9.dp))

            Row(
                verticalAlignment = Alignment.Top
            ) {

                Icon(
                    Icons.Outlined.LocationOn,
                    null,
                    tint = Color(0xFF82CBD4),
                    modifier = Modifier.size(16.dp)
                )

                Spacer(Modifier.width(5.dp))

                Text(
                    "${station.coordinates}\n${station.location}",
                    fontSize = 11.sp,
                    lineHeight = 14.sp,
                    color = Color(0xFFD5E5EA)
                )
            }

            Spacer(Modifier.height(10.dp))

            Text(
                station.description,
                fontSize = 11.sp,
                lineHeight = 14.sp,
                color = Color(0xFFD8E5E9)
            )

            //Spacer(Modifier.weight(1f))
            Spacer(Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {

                HeroStatCompact(
                    "CAPACITY",
                    station.capacity,
                    Modifier.weight(1f)
                )

                HeroStatCompact(
                    "ELEVATION",
                    station.elevation,
                    Modifier.weight(1f)
                )

                HeroStatCompact(
                    "ESTABLISHED",
                    station.established,
                    Modifier.weight(1f)
                )

                /*HeroStatCompact(
                    "LINK",
                    "Satellite",
                    Modifier.weight(1f)
                )*/
            }
        }
    }
}

@Composable
private fun HeroPill(
    text: String
) {

    Text(
        text,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        modifier = Modifier
            .clip(RoundedCornerShape(7.dp))
            .background(Color(0x335B7D86))
            .padding(
                horizontal = 8.dp,
                vertical = 5.dp
            )
    )
}

@Composable
private fun HeroStatCompact(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0x335B7B84))
            .border(
                1.dp,
                Color(0x335B7B84),
                RoundedCornerShape(10.dp)
            )
            .padding(8.dp)
    ) {

        Text(
            label,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF9EB5BF)
        )

        Spacer(Modifier.height(3.dp))

        Text(
            value,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}


// ============================================================
// OVERVIEW COMPONENTS
// ============================================================

@Composable
private fun OverviewSection(
    title: String,
    subtitle: String,
    icon: ImageVector,
    content: @Composable ColumnScope.() -> Unit
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(19.dp))
            .background(Card)
            .border(
                1.dp,
                Border,
                RoundedCornerShape(19.dp)
            )
            .padding(14.dp)
    ) {

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF193C4D)),
                contentAlignment = Alignment.Center
            ) {

                Icon(
                    icon,
                    null,
                    tint = Teal,
                    modifier = Modifier.size(17.dp)
                )
            }

            Spacer(Modifier.width(9.dp))

            Column {

                Text(
                    title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkText
                )

                Text(
                    subtitle,
                    fontSize = 12.sp,
                    color = Secondary
                )
            }
        }

        Spacer(Modifier.height(10.dp))

        DividerLine()

        Spacer(Modifier.height(11.dp))

        content()
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    unit: String,
    icon: ImageVector,
    tint: Color,
    badge: String = "Real"
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(110.dp)
            .padding(bottom = 9.dp)
            .clip(RoundedCornerShape(13.dp))
            .background(tint.copy(alpha = .10f))
            .border(
                1.dp,
                tint.copy(alpha = .22f),
                RoundedCornerShape(13.dp)
            )
            .padding(13.dp)
    ) {

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Icon(
                icon,
                null,
                tint = tint,
                modifier = Modifier.size(15.dp)
            )

            Spacer(Modifier.width(7.dp))

            Text(
                title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextTeal
            )

            Spacer(Modifier.weight(1f))

            Text(
                "• $badge",
                fontSize = 11.sp,
                color =
                    if (badge == "Real")
                        Green
                    else
                        Gold
            )
        }

        Spacer(Modifier.height(7.dp))

        Row(
            verticalAlignment = Alignment.Bottom
        ) {

            Text(
                value,
                fontSize = 25.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText
            )

            Spacer(Modifier.width(4.dp))

            Text(
                unit,
                fontSize = 11.sp,
                color = Secondary
            )
        }

        Spacer(Modifier.weight(1f))

        Box(
            Modifier
                .fillMaxWidth()
                .height(3.dp)
                .clip(RoundedCornerShape(50))
                .background(Color(0xFF294957))
        ) {

            Box(
                Modifier
                    .fillMaxWidth(.7f)
                    .height(3.dp)
                    .background(tint)
            )
        }
    }
}

@Composable
private fun StatusCard(
    title: String,
    value: String,
    tint: Color
) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(tint.copy(alpha = .10f))
            .border(
                1.dp,
                tint.copy(alpha = .25f),
                RoundedCornerShape(14.dp)
            )
            .padding(13.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        Icon(
            Icons.Outlined.Shield,
            null,
            tint = tint
        )

        Spacer(Modifier.width(9.dp))

        Column {

            Text(
                title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = tint
            )

            Text(
                value,
                fontSize = 12.sp,
                color = DarkText
            )
        }
    }
}


// ============================================================
// ASSET MODEL
// ============================================================

enum class AssetCategory {
    POWER,
    WATER,
    BUILDINGS,
    LOGISTICS
}

data class Asset(
    val id: String,
    val name: String,
    val category: AssetCategory,
    val type: String,
    val health: Double,
    val temperature: String? = null,
    val vibration: String? = null,
    val efficiency: String? = null,
    val runtime: String? = null,
    val condition: String,
    val warning: Boolean = false,
    val attributes: List<Pair<String, String>>,
    val inspection: String,
    val derived: Boolean = false
)


// ============================================================
// MAITRI ASSETS
// ============================================================

private val maitriAssets = listOf(

    Asset(
        "gen01",
        "Generator 01",
        AssetCategory.POWER,
        "POWER INFRASTRUCTURE",
        90.4,
        "78.2 °C",
        "2.7 mm/s",
        "85 %",
        "5,406",
        "Operational",
        false,
        listOf(
            "Rated Output" to "250 kW",
            "Fuel Rate" to "41.3 L/h",
            "Alternator Voltage" to "411 V 3-Phase",
            "Oil Pressure" to "4.5 bar"
        ),
        "2026-09-14 07:00 UTC"
    ),

    Asset(
        "gen02",
        "Generator 02",
        AssetCategory.POWER,
        "POWER INFRASTRUCTURE",
        61.6,
        "97.4 °C",
        "6.1 mm/s",
        "76.2 %",
        "7,895",
        "High Vibration — Inspection Due",
        true,
        listOf(
            "Rated Output" to "250 kW",
            "Fuel Rate" to "49.8 L/h",
            "Alternator Voltage" to "402 V 3-Phase",
            "Oil Pressure" to "3.4 bar"
        ),
        "2026-09-05 09:00 UTC"
    ),

    Asset(
        "battery",
        "Battery System",
        AssetCategory.POWER,
        "POWER STORAGE",
        87.3,
        "21.8 °C",
        null,
        "91.4 %",
        "2,840",
        "Operational",
        false,
        listOf(
            "Capacity" to "480 kWh",
            "State of Charge" to "82 %",
            "DC Voltage" to "768 V",
            "Cycle Count" to "1,284"
        ),
        "2026-09-19 11:00 UTC"
    ),

    Asset(
        "pump",
        "Pump",
        AssetCategory.WATER,
        "WATER LIFESUPPORT",
        90.1,
        "45.3 °C",
        "2.5 mm/s",
        "84.7 %",
        "3,101",
        "Operational",
        false,
        listOf(
            "Flow Rate" to "3.9 m³/h",
            "Discharge Pressure" to "2.9 bar",
            "Trace Heating" to "Active (+3 °C)"
        ),
        "2026-09-17 07:30 UTC"
    ),

    Asset(
        "waterStorage",
        "Storage",
        AssetCategory.WATER,
        "WATER STORAGE",
        94.2,
        "4.8 °C",
        null,
        "96.1 %",
        "8,214",
        "Operational",
        false,
        listOf(
            "Tank Capacity" to "18,000 L",
            "Current Volume" to "14,820 L",
            "Level" to "82.3 %",
            "Pressure" to "1.8 bar"
        ),
        "2026-09-18 08:00 UTC"
    ),

    Asset(
        "mainBuilding",
        "Main Building",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        89.1,
        "20.5 °C",
        "0.3 mm/s",
        "89.5 %",
        "21,981",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1011 hPa",
            "HVAC Return Air" to "+20.1 °C",
            "Airlock Cycles / Day" to "14"
        ),
        "2026-09-18 08:00 UTC"
    ),

    Asset(
        "laboratory",
        "Laboratory",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        93.6,
        "21.1 °C",
        "0.2 mm/s",
        "92.1 %",
        "19,840",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1010 hPa",
            "HVAC Return Air" to "+20.8 °C",
            "Airlock Cycles / Day" to "8"
        ),
        "2026-09-19 08:00 UTC"
    ),

    Asset(
        "buildingStorage",
        "Storage",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        91.8,
        "12.4 °C",
        null,
        "88.4 %",
        "17,231",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1009 hPa",
            "Storage Utilization" to "72 %",
            "Temperature" to "12.4 °C"
        ),
        "2026-09-20 09:00 UTC"
    ),

    Asset(
        "food",
        "Food",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        80.6,
        condition = "24 Days at Standard Burn Rate",
        attributes = listOf(
            "Dry Freeze Rations" to "1,520 kg",
            "Frozen Provisions" to "810 kg",
            "Per Capita Daily" to "3,200 kcal"
        ),
        inspection = "2026-09-24 07:00 UTC",
        derived = true
    ),

    Asset(
        "diesel",
        "Diesel",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        58.8,
        condition = "32 Days Reserve (Threshold 45d)",
        warning = true,
        attributes = listOf(
            "Tank 1 (Main)" to "61% (38,400 L)",
            "Tank 2 (Reserve)" to "49% (30,800 L)",
            "Consumption Trend" to "1,480 L/day"
        ),
        inspection = "2026-09-24 10:00 UTC",
        derived = true
    ),

    Asset(
        "medical",
        "Medical",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        96.3,
        condition = "Nominal",
        attributes = listOf(
            "Critical Medication" to "100 %",
            "Emergency Kits" to "8",
            "Sterile Supplies" to "94 %"
        ),
        inspection = "2026-09-23 08:00 UTC",
        derived = true
    ),

    Asset(
        "logisticsWater",
        "Water",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        91.4,
        condition = "Nominal",
        attributes = listOf(
            "Potable Reserve" to "14,820 L",
            "Daily Consumption" to "620 L/day",
            "Autonomy" to "23.9 days"
        ),
        inspection = "2026-09-22 07:00 UTC",
        derived = true
    ),

    Asset(
        "spares",
        "Spares",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        84.7,
        condition = "Nominal",
        attributes = listOf(
            "Critical Components" to "38",
            "Available Components" to "34",
            "Coverage" to "89 %"
        ),
        inspection = "2026-09-21 10:00 UTC",
        derived = true
    )
)


// ============================================================
// BHARATI ASSETS
// ============================================================

private val bharatiAssets = listOf(

    Asset(
        "gen01",
        "Generator 01",
        AssetCategory.POWER,
        "POWER INFRASTRUCTURE",
        86.7,
        "74.8 °C",
        "2.1 mm/s",
        "88.3 %",
        "6,742",
        "Operational",
        false,
        listOf(
            "Rated Output" to "300 kW",
            "Fuel Rate" to "44.6 L/h",
            "Alternator Voltage" to "414 V 3-Phase",
            "Oil Pressure" to "4.2 bar"
        ),
        "2026-09-15 06:30 UTC"
    ),

    Asset(
        "gen02",
        "Generator 02",
        AssetCategory.POWER,
        "POWER INFRASTRUCTURE",
        78.3,
        "82.6 °C",
        "3.8 mm/s",
        "81.7 %",
        "5,918",
        "Operational",
        false,
        listOf(
            "Rated Output" to "300 kW",
            "Fuel Rate" to "47.2 L/h",
            "Alternator Voltage" to "409 V 3-Phase",
            "Oil Pressure" to "3.9 bar"
        ),
        "2026-09-16 08:15 UTC"
    ),

    Asset(
        "battery",
        "Battery System",
        AssetCategory.POWER,
        "POWER STORAGE",
        92.1,
        "19.6 °C",
        null,
        "94.8 %",
        "1,936",
        "Operational",
        false,
        listOf(
            "Capacity" to "620 kWh",
            "State of Charge" to "76 %",
            "DC Voltage" to "816 V",
            "Cycle Count" to "942"
        ),
        "2026-09-19 10:30 UTC"
    ),

    Asset(
        "pump",
        "Pump",
        AssetCategory.WATER,
        "WATER LIFESUPPORT",
        87.6,
        "41.8 °C",
        "3.1 mm/s",
        "81.2 %",
        "4,286",
        "Operational",
        false,
        listOf(
            "Flow Rate" to "4.7 m³/h",
            "Discharge Pressure" to "3.2 bar",
            "Trace Heating" to "Active (+4 °C)"
        ),
        "2026-09-17 06:45 UTC"
    ),

    Asset(
        "waterStorage",
        "Storage",
        AssetCategory.WATER,
        "WATER STORAGE",
        88.9,
        "5.6 °C",
        null,
        "91.3 %",
        "7,482",
        "Operational",
        false,
        listOf(
            "Tank Capacity" to "24,000 L",
            "Current Volume" to "18,640 L",
            "Level" to "77.7 %",
            "Pressure" to "2.1 bar"
        ),
        "2026-09-18 07:20 UTC"
    ),

    Asset(
        "mainBuilding",
        "Main Building",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        94.3,
        "18.7 °C",
        "0.2 mm/s",
        "93.1 %",
        "18,642",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1008 hPa",
            "HVAC Return Air" to "+18.4 °C",
            "Airlock Cycles / Day" to "11"
        ),
        "2026-09-18 09:30 UTC"
    ),

    Asset(
        "laboratory",
        "Laboratory",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        91.7,
        "19.8 °C",
        "0.4 mm/s",
        "90.6 %",
        "16,384",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1009 hPa",
            "HVAC Return Air" to "+19.2 °C",
            "Airlock Cycles / Day" to "7"
        ),
        "2026-09-19 07:45 UTC"
    ),

    Asset(
        "buildingStorage",
        "Storage",
        AssetCategory.BUILDINGS,
        "BUILDINGS & HABITAT",
        86.5,
        "10.8 °C",
        null,
        "84.7 %",
        "14,729",
        "Nominal",
        false,
        listOf(
            "Internal Pressure" to "1007 hPa",
            "Storage Utilization" to "68 %",
            "Temperature" to "10.8 °C"
        ),
        "2026-09-20 08:40 UTC"
    ),

    Asset(
        "food",
        "Food",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        88.2,
        condition = "31 Days at Standard Burn Rate",
        attributes = listOf(
            "Dry Freeze Rations" to "1,860 kg",
            "Frozen Provisions" to "970 kg",
            "Per Capita Daily" to "3,450 kcal"
        ),
        inspection = "2026-09-24 06:30 UTC",
        derived = true
    ),

    Asset(
        "diesel",
        "Diesel",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        72.4,
        condition = "41 Days Reserve (Threshold 45d)",
        warning = true,
        attributes = listOf(
            "Tank 1 (Main)" to "68% (44,200 L)",
            "Tank 2 (Reserve)" to "57% (37,050 L)",
            "Consumption Trend" to "1,260 L/day"
        ),
        inspection = "2026-09-24 09:15 UTC",
        derived = true
    ),

    Asset(
        "medical",
        "Medical",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        93.8,
        condition = "Nominal",
        attributes = listOf(
            "Critical Medication" to "96 %",
            "Emergency Kits" to "11",
            "Sterile Supplies" to "91 %"
        ),
        inspection = "2026-09-23 07:30 UTC",
        derived = true
    ),

    Asset(
        "logisticsWater",
        "Water",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        95.1,
        condition = "Nominal",
        attributes = listOf(
            "Potable Reserve" to "19,640 L",
            "Daily Consumption" to "710 L/day",
            "Autonomy" to "27.7 days"
        ),
        inspection = "2026-09-22 06:50 UTC",
        derived = true
    ),

    Asset(
        "spares",
        "Spares",
        AssetCategory.LOGISTICS,
        "LOGISTICS & SURVIVAL",
        89.6,
        condition = "Nominal",
        attributes = listOf(
            "Critical Components" to "46",
            "Available Components" to "42",
            "Coverage" to "91 %"
        ),
        inspection = "2026-09-21 09:20 UTC",
        derived = true
    )
)


// ============================================================
// ASSETS SCREEN
// ============================================================

@Composable
private fun AssetsScreen(
    station: Station
) {
    var expandedAssetId by rememberSaveable { mutableStateOf<String?>(null) }
    var schematicMode by rememberSaveable { mutableStateOf(false) }

    var powerExpanded by rememberSaveable { mutableStateOf(true) }
    var waterExpanded by rememberSaveable { mutableStateOf(true) }
    var buildingsExpanded by rememberSaveable { mutableStateOf(true) }
    var logisticsExpanded by rememberSaveable { mutableStateOf(true) }

    val stationAssets = if (station.name == "Maitri") maitriAssets else bharatiAssets
    val selectedAsset = stationAssets.firstOrNull { it.id == expandedAssetId }
        ?: stationAssets.first()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            AssetsHeader(
                station = station,
                schematicMode = schematicMode,
                onModeChanged = { schematicMode = it }
            )
        }

        if (schematicMode) {
            item {
                AssetSchematic(
                    assets = stationAssets,
                    selectedId = selectedAsset.id,
                    onSelect = { id -> expandedAssetId = id }
                )
            }

            item {
                AssetDiagnostics(selectedAsset)
            }
        } else {
            item {
                AssetHierarchy(
                    assets = stationAssets,
                    expandedAssetId = expandedAssetId,
                    powerExpanded = powerExpanded,
                    waterExpanded = waterExpanded,
                    buildingsExpanded = buildingsExpanded,
                    logisticsExpanded = logisticsExpanded,
                    onPower = { powerExpanded = !powerExpanded },
                    onWater = { waterExpanded = !waterExpanded },
                    onBuildings = { buildingsExpanded = !buildingsExpanded },
                    onLogistics = { logisticsExpanded = !logisticsExpanded },
                    onSelect = { id ->
                        expandedAssetId = if (expandedAssetId == id) null else id
                    }
                )
            }
        }

        item { Spacer(Modifier.height(20.dp)) }
    }
}


// ============================================================
// ASSET HEADER
// ============================================================

@Composable
private fun AssetsHeader(
    station: Station,
    schematicMode: Boolean,
    onModeChanged: (Boolean) -> Unit
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF173849))
            .border(
                1.dp,
                Border,
                RoundedCornerShape(20.dp)
            )
            .padding(15.dp)
    ) {

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(11.dp))
                    .background(Color(0xFF214758)),
                contentAlignment = Alignment.Center
            ) {

                Icon(
                    Icons.Outlined.Inventory2,
                    null,
                    tint = TextTeal
                )
            }

            Spacer(Modifier.width(9.dp))

            Column(
                Modifier.weight(1f)
            ) {

                Text(
                    "Subsystem Asset Digital Twin",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkText
                )

                Text(
                    "${station.name} • Inspect physical station components, mechanical state, and operational health.",
                    fontSize = 12.sp,
                    color = Secondary
                )
            }
        }

        Spacer(Modifier.height(10.dp))

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF102B3A))
                    .border(1.dp, Border, RoundedCornerShape(10.dp))
                    .padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                AssetModeButton(
                    text = "Hierarchy",
                    icon = Icons.Outlined.AccountTree,
                    selected = !schematicMode,
                    onClick = { onModeChanged(false) }
                )
                AssetModeButton(
                    text = "3D Schematic",
                    icon = Icons.Outlined.ViewInAr,
                    selected = schematicMode,
                    onClick = { onModeChanged(true) }
                )
            }

            Spacer(Modifier.weight(1f))

            //SmallChip("13 NODES", Gold)
            //Spacer(Modifier.width(6.dp))
            //SmallChip("• MONITORING", Green)
        }
    }
}


@Composable
private fun AssetModeButton(
    text: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (selected) Color(0xFF1B4B5B) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 9.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            icon,
            contentDescription = text,
            tint = if (selected) TextTeal else Secondary,
            modifier = Modifier.size(14.dp)
        )
        Spacer(Modifier.width(5.dp))
        Text(
            text,
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = if (selected) DarkText else Secondary
        )
    }
}

// ============================================================
// 3D SCHEMATIC
// ============================================================

private data class SchematicAsset(
    val id: String,
    val x: Float,
    val y: Float,
    val width: Float,
    val depth: Float,
    val height: Float,
    val kind: String
)

private val schematicAssets = listOf(
    // Coordinates are intentionally spread out to reproduce the reference
    // station layout and prevent neighboring assets from overlapping.
    // Deliberately spread out to keep the silhouettes visually separate on phone-sized canvases.
    SchematicAsset("mainBuilding", 3.10f, 1.55f, 2.85f, 2.05f, 2.10f, "building"),
    SchematicAsset("buildingStorage", 1.75f, 3.55f, 1.70f, 1.35f, 1.05f, "building"),
    SchematicAsset("laboratory", 4.85f, 1.95f, 1.55f, 1.35f, 1.20f, "building"),
    SchematicAsset("pump", 1.15f, 4.70f, .72f, .72f, 1.15f, "tank"),
    SchematicAsset("waterStorage", 2.55f, 5.55f, .78f, .78f, 1.65f, "tank"),
    SchematicAsset("gen01", 6.35f, 1.45f, 1.10f, .95f, 1.15f, "generator"),
    SchematicAsset("gen02", 7.70f, 1.55f, 1.00f, .90f, 1.05f, "generator2"),
    SchematicAsset("battery", 6.55f, 3.10f, 1.25f, .90f, .75f, "battery"),
    SchematicAsset("diesel", 4.55f, 4.15f, 1.55f, .52f, .42f, "diesel"),
    SchematicAsset("food", 3.65f, 6.00f, .78f, .68f, .62f, "crate"),
    SchematicAsset("medical", 5.05f, 6.55f, .78f, .68f, .62f, "crate"),
    SchematicAsset("logisticsWater", 6.55f, 5.95f, .78f, .68f, .62f, "crate"),
    SchematicAsset("spares", 8.15f, 5.15f, .78f, .68f, .62f, "crate")
)


private fun schematicDisplayName(id: String): String = when (id) {
    "mainBuilding" -> "Main building"
    "buildingStorage" -> "Storage facility"
    "laboratory" -> "Lab module"
    "pump" -> "Lake water pump house"
    "waterStorage" -> "Water tank"
    "gen01" -> "Generator 1"
    "gen02" -> "Generator 2"
    "battery" -> "Battery System"
    "diesel" -> "Diesel reserve"
    "food" -> "Food supply"
    "medical" -> "Medical supplies"
    "logisticsWater" -> "Water reserves"
    "spares" -> "Spare parts"
    else -> id
}

@Composable
private fun AssetSchematic(
    assets: List<Asset>,
    selectedId: String,
    onSelect: (String) -> Unit
) {
    val available = schematicAssets.filter { item -> assets.any { it.id == item.id } }

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFF050D12))
            .border(1.dp, Border, RoundedCornerShape(18.dp))
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .background(Color(0xFF102D3E))
                .padding(horizontal = 14.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    "3D STATION SCHEMATIC",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = .8.sp,
                    color = TextTeal
                )
                Text(
                    "Select a physical asset on the station model",
                    fontSize = 12.sp,
                    color = Secondary
                )
            }
            SmallChip("${available.size} NODES", Gold)
        }

        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(330.dp)
                .pointerInput(available, selectedId) {
                    detectTapGestures { offset ->
                        val sx = minOf(size.width / 14f, 52f)
                        val sy = sx * .50f
                        val origin = Offset(size.width / 2f, 60f)

                        fun point(x: Float, y: Float, z: Float = 0f): Offset =
                            Offset(
                                origin.x + (x - y) * sx,
                                origin.y + (x + y) * sy - z * sy
                            )

                        val hit = available
                            .asReversed()
                            .firstOrNull { item ->
                                val corners = schematicBoxCorners(item, ::point, sx, sy)
                                val center = point(item.x, item.y, item.height * .45f)
                                val radius = maxOf(item.width, item.depth) * sx * .9f + item.height * sy
                                (offset - center).getDistance() <= radius
                            }

                        hit?.let { onSelect(it.id) }
                    }
                }
        ) {
            val sx = minOf(size.width / 14f, 52f)
            val sy = sx * .50f
            val origin = Offset(size.width / 2f, 60f)

            fun point(x: Float, y: Float, z: Float = 0f): Offset =
                Offset(
                    origin.x + (x - y) * sx,
                    origin.y + (x + y) * sy - z * sy
                )

            fun pathOf(points: List<Offset>): Path = Path().apply {
                val first = points.first()
                moveTo(first.x, first.y)
                points.drop(1).forEach { p -> lineTo(p.x, p.y) }
                close()
            }

            // Light operational pad.
            val ground = pathOf(
                listOf(
                    point(0f, 0f),
                    point(11f, 0f),
                    point(11f, 9f),
                    point(0f, 9f)
                )
            )
            drawPath(ground, Color(0xFF91A9B5))

            // Isometric grid on the operational pad.
            for (x in 0..11) {
                drawLine(
                    Color(0xFFDCF0F5).copy(alpha = .72f),
                    point(x.toFloat(), 0f),
                    point(x.toFloat(), 9f),
                    strokeWidth = 1f
                )
            }
            for (y in 0..9) {
                drawLine(
                    Color(0xFFDCF0F5).copy(alpha = .72f),
                    point(0f, y.toFloat()),
                    point(11f, y.toFloat()),
                    strokeWidth = 1f
                )
            }

            // Dark outer grid, as in the reference.
            for (x in -3..14) {
                drawLine(
                    Color(0xFFB8D5DF).copy(alpha = .65f),
                    point(x.toFloat(), -2f),
                    point(x.toFloat(), 11f),
                    strokeWidth = .8f
                )
            }
            for (y in -2..11) {
                drawLine(
                    Color(0xFFB8D5DF).copy(alpha = .65f),
                    point(-3f, y.toFloat()),
                    point(14f, y.toFloat()),
                    strokeWidth = .8f
                )
            }

            // Snow / ice cones.
            listOf(
                1.1f to 1.2f,
                9.0f to 1.8f,
                1.1f to 5.9f,
                9.2f to 6.0f,
                7.7f to 8.0f,
                8.7f to 8.0f
            ).forEach { (x, y) ->
                val base = point(x, y)
                val r = 12f
                val top = Offset(base.x, base.y - 25f)
                val left = Offset(base.x - r, base.y + 7f)
                val right = Offset(base.x + r, base.y + 7f)

                drawPath(
                    pathOf(listOf(top, right, base)),
                    Color(0xFFB8C8CF)
                )
                drawPath(
                    pathOf(listOf(top, base, left)),
                    Color(0xFFA6B9C2)
                )
            }

            // Draw farther objects first and nearer objects last so the
            // schematic has the correct visual depth ordering.
            available
                .sortedBy { it.x + it.y }
                .forEach { item ->
                    drawSchematicAsset(
                        item = item,
                        selected = item.id == selectedId,
                        point = ::point,
                        sx = sx,
                        sy = sy
                    )
                }

            // Floating selected-object label.
            available.firstOrNull { it.id == selectedId }?.let { selected ->
                val labelPoint = point(selected.x, selected.y, selected.height + .45f)
                val text = schematicDisplayName(selected.id).uppercase()
                val labelWidth = text.length * 6.1f + 18f
                val labelHeight = 22f
                val left = (labelPoint.x - labelWidth / 2f)
                    .coerceIn(8f, size.width - labelWidth - 8f)
                val top = (labelPoint.y - labelHeight)
                    .coerceIn(8f, size.height - labelHeight - 8f)

                drawRoundRect(
                    color = Color(0xFF0A2635),
                    topLeft = Offset(left, top),
                    size = androidx.compose.ui.geometry.Size(labelWidth, labelHeight),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(5f, 5f)
                )
                drawRoundRect(
                    color = TextTeal,
                    topLeft = Offset(left, top),
                    size = androidx.compose.ui.geometry.Size(labelWidth, 2f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(1f, 1f)
                )

                drawContext.canvas.nativeCanvas.drawText(
                    text,
                    left + 9f,
                    top + 15f,
                    Paint(Paint.ANTI_ALIAS_FLAG).apply {
                        color = TextTeal.toArgb()
                        textSize = 11f
                        typeface = android.graphics.Typeface.create(
                            android.graphics.Typeface.DEFAULT,
                            android.graphics.Typeface.BOLD
                        )
                    }
                )

                drawLine(
                    Color(0xFFD7E7EA).copy(alpha = .7f),
                    Offset(labelPoint.x, top + labelHeight),
                    point(selected.x, selected.y, selected.height),
                    strokeWidth = 1f
                )
            }
        }

        Row(
            Modifier
                .fillMaxWidth()
                .background(Color(0xFF102D3E))
                .padding(horizontal = 14.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Illustrative schematic • not to scale",
                fontSize = 11.sp,
                color = Secondary
            )
            Spacer(Modifier.width(10.dp))
            Text("•", color = Gold, fontSize = 12.sp)
            Spacer(Modifier.width(3.dp))
            Text(
                "Selected: ${assets.firstOrNull { it.id == selectedId }?.name ?: "Asset"}",
                fontSize = 11.sp,
                color = Secondary
            )
        }
    }
}

private fun schematicBoxCorners(
    item: SchematicAsset,
    point: (Float, Float, Float) -> Offset,
    sx: Float,
    sy: Float
): List<Offset> {
    val hw = item.width * .5f
    val hd = item.depth * .5f
    return listOf(
        point(item.x - hw, item.y - hd, item.height),
        point(item.x + hw, item.y - hd, item.height),
        point(item.x + hw, item.y + hd, item.height),
        point(item.x - hw, item.y + hd, item.height),
        point(item.x - hw, item.y - hd, 0f),
        point(item.x + hw, item.y - hd, 0f),
        point(item.x + hw, item.y + hd, 0f),
        point(item.x - hw, item.y + hd, 0f)
    )
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawSchematicAsset(
    item: SchematicAsset,
    selected: Boolean,
    point: (Float, Float, Float) -> Offset,
    sx: Float,
    sy: Float
) {
    val hw = item.width * .5f
    val hd = item.depth * .5f

    // True isometric box corners. X/Y determine the ground footprint;
    // Z moves vertically on screen, so vertical edges stay vertical.
    val a = point(item.x - hw, item.y - hd, 0f)
    val b = point(item.x + hw, item.y - hd, 0f)
    val c = point(item.x + hw, item.y + hd, 0f)
    val d = point(item.x - hw, item.y + hd, 0f)

    val at = point(item.x - hw, item.y - hd, item.height)
    val bt = point(item.x + hw, item.y - hd, item.height)
    val ct = point(item.x + hw, item.y + hd, item.height)
    val dt = point(item.x - hw, item.y + hd, item.height)

    val body = if (selected) Color(0xFF4DB08C) else Color(0xFF104B4D)
    val sideA = if (selected) Color(0xFF3A9278) else Color(0xFF0D3B3F)
    val sideB = if (selected) Color(0xFF2C7C69) else Color(0xFF0A3036)

    fun poly(points: List<Offset>, color: Color) {
        val path = Path().apply {
            val first = points.first()
            moveTo(first.x, first.y)
            points.drop(1).forEach { p -> lineTo(p.x, p.y) }
            close()
        }
        drawPath(path, color)
    }

    // Back/side faces first, then top.
    poly(listOf(dt, ct, c, d), sideA)
    poly(listOf(bt, ct, c, b), sideB)
    poly(listOf(at, bt, ct, dt), body)

    // Equipment-specific details are kept upright on the object.
    val topCenter = point(item.x, item.y, item.height)
    when (item.kind) {
        "tank" -> {
            drawCircle(
                Color(0xFF1B5557),
                radius = item.width * sx * .35f,
                center = topCenter
            )
            drawLine(
                Color(0xFF9ED8D1),
                Offset(topCenter.x, topCenter.y),
                Offset(topCenter.x, topCenter.y - item.height * sy * .28f),
                strokeWidth = 2f
            )
        }
        "generator", "generator2" -> {
            drawRoundRect(
                color = Color(0xFF143F45),
                topLeft = Offset(
                    topCenter.x - item.width * sx * .30f,
                    topCenter.y - item.depth * sy * .12f
                ),
                size = androidx.compose.ui.geometry.Size(
                    item.width * sx * .60f,
                    maxOf(4f, item.depth * sy * .24f)
                ),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(2f, 2f)
            )
            drawCircle(
                Gold,
                radius = 3f,
                center = Offset(
                    topCenter.x + item.width * sx * .22f,
                    topCenter.y
                )
            )
        }
        "battery" -> {
            drawLine(
                Color(0xFF8FC7C4),
                Offset(topCenter.x - item.width * sx * .25f, topCenter.y),
                Offset(topCenter.x + item.width * sx * .25f, topCenter.y),
                strokeWidth = 2f
            )
        }
        "diesel" -> {
            drawCircle(
                Gold,
                radius = 3.5f,
                center = topCenter
            )
        }
        "crate" -> {
            drawCircle(
                Color(0xFF9CD6C8),
                radius = 3f,
                center = topCenter
            )
        }
    }

    drawCircle(
        color = if (selected) Color(0xFF73E0C1) else if (item.kind == "generator2") Gold else Color(0xFF70C9A8),
        radius = if (selected) 3.5f else 2.5f,
        center = Offset(topCenter.x, topCenter.y - 3f)
    )
}

// ============================================================
// ASSET HIERARCHY
// ============================================================

@Composable
private fun AssetHierarchy(
    assets: List<Asset>,
    expandedAssetId: String?,

    powerExpanded: Boolean,
    waterExpanded: Boolean,
    buildingsExpanded: Boolean,
    logisticsExpanded: Boolean,

    onPower: () -> Unit,
    onWater: () -> Unit,
    onBuildings: () -> Unit,
    onLogistics: () -> Unit,

    onSelect: (String) -> Unit
) {

    val powerAssets =
        assets.filter {
            it.category == AssetCategory.POWER
        }

    val waterAssets =
        assets.filter {
            it.category == AssetCategory.WATER
        }

    val buildingAssets =
        assets.filter {
            it.category == AssetCategory.BUILDINGS
        }

    val logisticsAssets =
        assets.filter {
            it.category == AssetCategory.LOGISTICS
        }

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Card)
            .border(
                1.dp,
                Border,
                RoundedCornerShape(18.dp)
            )
            .padding(14.dp)
    ) {

        Text(
            "Subsystem Asset Hierarchy",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = DarkText
        )

        Text(
            "Select an asset node to inspect live state",
            fontSize = 12.sp,
            color = Secondary
        )

        Spacer(Modifier.height(10.dp))

        DividerLine()

        AssetCategorySection(
            "POWER",
            Icons.Outlined.Bolt,
            powerAssets.size,
            powerExpanded,
            powerAssets.any { it.warning },
            onPower
        ) {

            powerAssets.forEach { asset ->

                TreeItem(
                    asset = asset,
                    expanded = expandedAssetId == asset.id,
                    onToggle = { onSelect(asset.id) }
                )
            }
        }

        AssetCategorySection(
            "WATER",
            Icons.Outlined.WaterDrop,
            waterAssets.size,
            waterExpanded,
            waterAssets.any { it.warning },
            onWater
        ) {

            waterAssets.forEach { asset ->

                TreeItem(
                    asset = asset,
                    expanded = expandedAssetId == asset.id,
                    onToggle = { onSelect(asset.id) }
                )
            }
        }

        AssetCategorySection(
            "BUILDINGS",
            Icons.Outlined.Business,
            buildingAssets.size,
            buildingsExpanded,
            buildingAssets.any { it.warning },
            onBuildings
        ) {

            buildingAssets.forEach { asset ->

                TreeItem(
                    asset = asset,
                    expanded = expandedAssetId == asset.id,
                    onToggle = { onSelect(asset.id) }
                )
            }
        }

        AssetCategorySection(
            "LOGISTICS",
            Icons.Outlined.Inventory2,
            logisticsAssets.size,
            logisticsExpanded,
            logisticsAssets.any { it.warning },
            onLogistics
        ) {

            logisticsAssets.forEach { asset ->

                TreeItem(
                    asset = asset,
                    expanded = expandedAssetId == asset.id,
                    onToggle = { onSelect(asset.id) }
                )
            }
        }
    }
}


@Composable
private fun AssetCategorySection(
    title: String,
    icon: ImageVector,
    count: Int,
    expanded: Boolean,
    warning: Boolean,
    onToggle: () -> Unit,
    content: @Composable ColumnScope.() -> Unit
) {

    Column {

        Row(
            Modifier
                .fillMaxWidth()
                .clickable(onClick = onToggle)
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Text(
                if (expanded) "⌄" else "›",
                fontSize = 12.sp,
                color = Secondary,
                modifier = Modifier.width(18.dp)
            )

            Icon(
                icon,
                null,
                tint = Secondary,
                modifier = Modifier.size(16.dp)
            )

            Spacer(Modifier.width(7.dp))

            Text(
                title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextTeal
            )

            Spacer(Modifier.weight(1f))

            Text(
                count.toString(),
                fontSize = 11.sp,
                color = Secondary,
                modifier = Modifier
                    .background(
                        Color(0xFF1A3A4A),
                        RoundedCornerShape(5.dp)
                    )
                    .padding(
                        horizontal = 6.dp,
                        vertical = 3.dp
                    )
            )

            Spacer(Modifier.width(6.dp))

            Box(
                Modifier
                    .size(7.dp)
                    .clip(RoundedCornerShape(50))
                    .background(
                        if (warning) Gold else Green
                    )
            )
        }

        if (expanded) {

            Column(
                Modifier.padding(start = 15.dp)
            ) {
                content()
            }
        }
    }
}


@Composable
private fun TreeItem(
    asset: Asset,
    expanded: Boolean,
    onToggle: () -> Unit
) {

    val selected = expanded

    Column(
        Modifier.fillMaxWidth()
    ) {

        Row(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(9.dp))
                .background(
                    if (selected)
                        Color(0xFF173F50)
                    else
                        Color.Transparent
                )
                .clickable(onClick = onToggle)
                .padding(
                    horizontal = 9.dp,
                    vertical = 8.dp
                ),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Text(
                if (expanded) "⌄" else "›",
                fontSize = 12.sp,
                color = Secondary,
                modifier = Modifier.width(18.dp)
            )

            Icon(
                Icons.Outlined.Settings,
                null,
                tint = Secondary,
                modifier = Modifier.size(13.dp)
            )

            Spacer(Modifier.width(8.dp))

            Text(
                asset.name,
                Modifier.weight(1f),
                fontSize = 12.sp,
                fontWeight =
                    if (selected)
                        FontWeight.Bold
                    else
                        FontWeight.Normal,
                color =
                    if (selected)
                        TextTeal
                    else
                        Secondary
            )

            Box(
                Modifier
                    .size(7.dp)
                    .clip(RoundedCornerShape(50.dp))
                    .background(
                        if (asset.warning)
                            Gold
                        else
                            Green
                    )
            )
        }

        if (expanded) {
            Spacer(Modifier.height(6.dp))

            AssetDiagnostics(asset)

            Spacer(Modifier.height(6.dp))
        }
    }
}


// ============================================================
// ASSET DIAGNOSTICS
// ============================================================

@Composable
private fun AssetDiagnostics(
    asset: Asset
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Card)
            .border(
                1.dp,
                Color(0xFF3A3450),
                RoundedCornerShape(20.dp)
            )
            .padding(14.dp)
    ) {

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Icon(
                Icons.Outlined.MonitorHeart,
                null,
                tint = Purple
            )

            Spacer(Modifier.width(8.dp))

            Column(
                Modifier.weight(1f)
            ) {

                Text(
                    "ASSET DIAGNOSTICS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Purple
                )

                Text(
                    "Selected component details",
                    fontSize = 12.sp,
                    color = Secondary
                )
            }

            SmallChip(
                "• LIVE REGISTRY",
                Green
            )
        }

        Spacer(Modifier.height(10.dp))

        DividerLine()

        Spacer(Modifier.height(12.dp))

        AssetIdentity(asset)

        Spacer(Modifier.height(15.dp))

        Text(
            "LIVE INSTRUMENTATION",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = .8.sp,
            color = Teal
        )

        Text(
            "Asset Telemetry",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = DarkText
        )

        Spacer(Modifier.height(8.dp))

        Telemetry(asset)

        Spacer(Modifier.height(14.dp))

        OperationalCondition(asset)

        Spacer(Modifier.height(15.dp))

        Text(
            "ENGINEERING DATA",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = .8.sp,
            color = Teal
        )

        Text(
            "Technical Attributes",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = DarkText
        )

        Spacer(Modifier.height(8.dp))

        Attributes(asset.attributes)

        Spacer(Modifier.height(13.dp))

        DividerLine()

        Spacer(Modifier.height(9.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Text(
                "◷",
                color = Secondary
            )

            Spacer(Modifier.width(6.dp))

            Text(
                "LAST FIELD INSPECTION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Secondary
            )

            Spacer(Modifier.weight(1f))

            Text(
                asset.inspection,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText
            )
        }
    }
}


@Composable
private fun AssetIdentity(
    asset: Asset
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(15.dp))
            .background(Color(0xFF163946))
            .padding(13.dp)
    ) {

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF214758)),
                contentAlignment = Alignment.Center
            ) {

                Icon(
                    when (asset.category) {

                        AssetCategory.POWER ->
                            Icons.Outlined.Bolt

                        AssetCategory.WATER ->
                            Icons.Outlined.WaterDrop

                        AssetCategory.BUILDINGS ->
                            Icons.Outlined.Business

                        AssetCategory.LOGISTICS ->
                            Icons.Outlined.Inventory2
                    },
                    null,
                    tint = Teal
                )
            }

            Spacer(Modifier.width(10.dp))

            Column(
                Modifier.weight(1f)
            ) {

                Text(
                    asset.type,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = .7.sp,
                    color = Teal
                )

                Text(
                    asset.name,
                    fontSize = 21.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkText
                )

                Text(
                    "◉ Digital Twin Connected  •  Live asset telemetry",
                    fontSize = 11.sp,
                    color = Secondary
                )
            }
        }

        Spacer(Modifier.height(9.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {

            SmallChip(
                if (asset.warning)
                    "⚠ Warning"
                else
                    "● Healthy",

                if (asset.warning)
                    Gold
                else
                    Green
            )

            SmallChip(
                if (asset.derived)
                    "• Derived"
                else
                    "• Simulated",

                if (asset.derived)
                    Purple
                else
                    Gold
            )
        }
    }
}


@Composable
private fun Telemetry(
    asset: Asset
) {

    TelemetryCard(
        "SYSTEM HEALTH",
        "${asset.health} %",
        Green
    )

    asset.temperature?.let {

        TelemetryCard(
            "TEMPERATURE",
            it,
            Teal
        )
    }

    asset.vibration?.let {

        TelemetryCard(
            "VIBRATION",
            it,
            Gold
        )
    }

    asset.efficiency?.let {

        TelemetryCard(
            "EFFICIENCY",
            it,
            Teal
        )
    }

    asset.runtime?.let {

        TelemetryCard(
            "RUNTIME",
            "$it h",
            Purple
        )
    }
}


@Composable
private fun TelemetryCard(
    title: String,
    value: String,
    tint: Color
) {

    Column(
        Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .clip(RoundedCornerShape(13.dp))
            .background(tint.copy(alpha = .10f))
            .border(
                1.dp,
                tint.copy(alpha = .2f),
                RoundedCornerShape(13.dp)
            )
            .padding(13.dp)
    ) {

        Row {

            Text(
                title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = .7.sp,
                color = tint
            )

            Spacer(Modifier.weight(1f))

            Icon(
                Icons.Outlined.MonitorHeart,
                null,
                tint = tint,
                modifier = Modifier.size(16.dp)
            )
        }

        Spacer(Modifier.height(7.dp))

        Text(
            value,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = DarkText
        )

        Spacer(Modifier.height(7.dp))

        Box(
            Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(50))
                .background(Color(0xFF294957))
        ) {

            Box(
                Modifier
                    .fillMaxWidth(.72f)
                    .height(4.dp)
                    .background(tint)
            )
        }
    }
}


@Composable
private fun OperationalCondition(
    asset: Asset
) {

    val tint =
        if (asset.warning)
            Gold
        else
            Green

    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(tint.copy(alpha = .11f))
            .border(
                1.dp,
                tint.copy(alpha = .25f),
                RoundedCornerShape(14.dp)
            )
            .padding(13.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        Icon(
            Icons.Outlined.Shield,
            null,
            tint = tint
        )

        Spacer(Modifier.width(9.dp))

        Column {

            Text(
                "OPERATIONAL CONDITION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = tint
            )

            Text(
                asset.condition,
                fontSize = 12.sp,
                color = DarkText
            )
        }

        Spacer(Modifier.weight(1f))

        Box(
            Modifier
                .size(7.dp)
                .clip(RoundedCornerShape(50))
                .background(tint)
        )
    }
}


@Composable
private fun Attributes(
    attributes: List<Pair<String, String>>
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF142F3F))
            .border(
                1.dp,
                Border,
                RoundedCornerShape(12.dp)
            )
    ) {

        attributes.forEachIndexed { index, pair ->

            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(
                        horizontal = 10.dp,
                        vertical = 9.dp
                    ),
                verticalAlignment = Alignment.CenterVertically
            ) {

                Box(
                    Modifier
                        .size(5.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Teal)
                )

                Spacer(Modifier.width(7.dp))

                Text(
                    pair.first,
                    Modifier.weight(1f),
                    fontSize = 12.sp,
                    color = Secondary
                )

                Text(
                    pair.second,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkText,
                    textAlign = TextAlign.End
                )
            }

            if (index != attributes.lastIndex) {
                DividerLine()
            }
        }
    }
}


// ============================================================
// WHAT-IF
// ============================================================

private enum class Scenario {
    GENERATOR_FAILURE,
    BLIZZARD,
    RESUPPLY_DELAY
}

private data class SimulationCascadeStep(
    val day: Int,
    val label: String,
    val text: String,
    val tint: Color
)

private data class SimulationTimelineEvent(
    val day: Int,
    val text: String
)

private data class SimulationScenarioData(
    val title: String,
    val cascade: List<SimulationCascadeStep>,
    val timeline: List<SimulationTimelineEvent>,
    val mitigation: List<String>,
    val maxDay: Int
)

private fun simulationData(scenario: Scenario): SimulationScenarioData =
    when (scenario) {
        Scenario.BLIZZARD -> SimulationScenarioData(
            title = "BLIZZARD",
            cascade = listOf(
                SimulationCascadeStep(0, "INITIAL TRIGGER", "Ambient temp drops below -42°C", Red),
                SimulationCascadeStep(1, "CASCADE STAGE 2", "Wind sustained above 32 m/s", Teal),
                SimulationCascadeStep(5, "CASCADE STAGE 3", "Structural thermal load spikes", Teal),
                SimulationCascadeStep(5, "FINAL IMPACT", "Outside work strictly suspended", Green)
            ),
            timeline = listOf(
                SimulationTimelineEvent(0, "Category 3 blizzard warning triggered; wind gusting 32 m/s"),
                SimulationTimelineEvent(1, "Generation drops to 123 kW, consumption at 152 kW"),
                SimulationTimelineEvent(5, "Diesel reserves fall below 15% operational threshold (projected 35-day reserve exhausted early)")
            ),
            mitigation = listOf(
                "WARNING: diesel reaches 15% operational threshold in 5 days — begin non-critical load reduction now",
                "Seal outer airlocks and engage emergency perimeter heating systems",
                "Lock down external transport and suspend outdoor scientific array operations",
                "Reroute power to maintain primary satellite communication radomes and life support"
            ),
            maxDay = 5
        )

        Scenario.GENERATOR_FAILURE -> SimulationScenarioData(
            title = "GENERATOR FAILURE",
            cascade = listOf(
                SimulationCascadeStep(0, "INITIAL TRIGGER", "Generator offline", Red),
                SimulationCascadeStep(1, "CASCADE STAGE 2", "Available generation reduced", Teal),
                SimulationCascadeStep(5, "CASCADE STAGE 3", "Critical loads prioritized", Teal),
                SimulationCascadeStep(5, "FINAL IMPACT", "Backup capacity activated", Green)
            ),
            timeline = listOf(
                SimulationTimelineEvent(0, "Generator failure detected on primary power bus"),
                SimulationTimelineEvent(1, "Generation drops to 75 kW, consumption at 123 kW"),
                SimulationTimelineEvent(5, "Diesel reserves fall below 15% operational threshold (projected 32-day reserve exhausted early)")
            ),
            mitigation = listOf(
                "WARNING: diesel reaches 15% operational threshold in 5 days — begin non-critical load reduction now",
                "Prioritize critical life-support and habitat heating loads over auxiliary research",
                "Schedule emergency mechanical inspection and injector rebuild on backup generator",
                "Projected net balance: -47 kW — request priority spare parts resupply"
            ),
            maxDay = 5
        )

        Scenario.RESUPPLY_DELAY -> SimulationScenarioData(
            title = "RESUPPLY DELAY",
            cascade = listOf(
                SimulationCascadeStep(0, "INITIAL TRIGGER", "Vessel navigation blocked by sea ice", Red),
                SimulationCascadeStep(0, "CASCADE STAGE 2", "Fuel delivery pushed back 45 days", Teal),
                SimulationCascadeStep(0, "CASCADE STAGE 3", "Food rations conservation triggered", Teal),
                SimulationCascadeStep(42, "FINAL IMPACT", "Secondary module power shaved", Green)
            ),
            timeline = listOf(
                SimulationTimelineEvent(0, "Supply vessel encountered polar ice; arrival delayed"),
                SimulationTimelineEvent(42, "Diesel reserves exhausted on day 42 — 3 days before resupply arrives")
            ),
            mitigation = listOf(
                "WARNING: projected diesel deficit of 3 days before resupply on day 45 — activate stage-1 conservation",
                "Reduce non-essential research power usage during night hours",
                "Audit food inventory and transition to emergency freeze-dried rationing",
                "Coordinate with nearby international stations for emergency supply air-drop contingency"
            ),
            maxDay = 42
        )
    }

@Composable
private fun WhatIfScreen(
    station: Station
) {
    var selectedScenario by rememberSaveable {
        mutableStateOf(Scenario.GENERATOR_FAILURE)
    }

    var isSimulating by rememberSaveable {
        mutableStateOf(false)
    }

    var elapsedSimulationMs by rememberSaveable {
        mutableStateOf(0L)
    }

    var visibleTimelineCount by rememberSaveable {
        mutableStateOf(0)
    }

    var cascadeVisibleCount by rememberSaveable {
        mutableStateOf(0)
    }

    var mitigationVisibleCount by rememberSaveable {
        mutableStateOf(0)
    }

    val data = simulationData(selectedScenario)
    val listState = rememberLazyListState()

    val timelineTotal = data.timeline.size.coerceAtLeast(1)
    val cascadeTotal = data.cascade.size.coerceAtLeast(1)
    val mitigationTotal = data.mitigation.size.coerceAtLeast(1)
    val stepDurationMs = 2_000L

    // The simulation is deliberately sequential:
    //
    //   1. Cascade stages
    //   2. Event timeline
    //   3. Mitigation actions
    //
    // The first item in each phase appears as soon as that phase begins;
    // every additional item in that phase appears 2 seconds later.
    val cascadeDurationMs = (cascadeTotal - 1).coerceAtLeast(0) * stepDurationMs
    val timelineDurationMs = (timelineTotal - 1).coerceAtLeast(0) * stepDurationMs
    val mitigationDurationMs = (mitigationTotal - 1).coerceAtLeast(0) * stepDurationMs
    val timelineStartMs = cascadeDurationMs
    val mitigationStartMs = timelineStartMs + timelineDurationMs
    val totalSimulationMs = mitigationStartMs + mitigationDurationMs

    // 0 = cascade, 1 = timeline, 2 = mitigation, 3 = complete.
    var simulationPhase by rememberSaveable {
        mutableStateOf(0)
    }

    LaunchedEffect(isSimulating, selectedScenario) {
        if (!isSimulating) return@LaunchedEffect

        elapsedSimulationMs = 0L
        cascadeVisibleCount = 1.coerceAtMost(data.cascade.size)
        visibleTimelineCount = 0
        mitigationVisibleCount = 0
        simulationPhase = 0

        if (data.cascade.isEmpty()) {
            cascadeVisibleCount = 0
            simulationPhase = 1
        }

        val startTime = System.currentTimeMillis()

        while (true) {
            val elapsed =
                (System.currentTimeMillis() - startTime)
                    .coerceAtMost(totalSimulationMs)

            elapsedSimulationMs = elapsed

            // --------------------------------------------------------
            // PHASE 1: IMPACT CASCADE
            // --------------------------------------------------------
            val newCascadeCount =
                if (data.cascade.isEmpty()) {
                    0
                } else {
                    (1 + (elapsed / stepDurationMs).toInt())
                        .coerceAtMost(data.cascade.size)
                }

            cascadeVisibleCount = newCascadeCount

            if (elapsed < timelineStartMs) {
                simulationPhase = 0
            }

            // --------------------------------------------------------
            // PHASE 2: EVENT TIMELINE
            // --------------------------------------------------------
            if (elapsed >= timelineStartMs) {
                simulationPhase = 1

                val timelineElapsed = elapsed - timelineStartMs
                val newTimelineCount =
                    if (data.timeline.isEmpty()) {
                        0
                    } else {
                        (1 + (timelineElapsed / stepDurationMs).toInt())
                            .coerceAtMost(data.timeline.size)
                    }

                visibleTimelineCount = newTimelineCount
            }

            // --------------------------------------------------------
            // PHASE 3: RECOMMENDED MITIGATION
            // --------------------------------------------------------
            if (elapsed >= mitigationStartMs) {
                simulationPhase = 2

                val mitigationElapsed = elapsed - mitigationStartMs
                val newMitigationCount =
                    if (data.mitigation.isEmpty()) {
                        0
                    } else {
                        (1 + (mitigationElapsed / stepDurationMs).toInt())
                            .coerceAtMost(data.mitigation.size)
                    }

                mitigationVisibleCount = newMitigationCount
            }

            if (elapsed >= totalSimulationMs) {
                break
            }

            delay(50L)
        }

        // Ensure the final frame contains everything before completion.
        elapsedSimulationMs = totalSimulationMs
        cascadeVisibleCount = data.cascade.size
        visibleTimelineCount = data.timeline.size
        mitigationVisibleCount = data.mitigation.size
        simulationPhase = 3
        isSimulating = false
    }

    // Scroll only when a NEW card/stage/action is inserted. The continuously
    // changing clock/progress values never trigger scrolling, preventing the
    // previous jerky movement.
    LaunchedEffect(
        cascadeVisibleCount,
        visibleTimelineCount,
        mitigationVisibleCount
    ) {
        if (listState.layoutInfo.totalItemsCount > 0) {
            // Let Compose finish measuring the newly inserted content first.
            withFrameNanos { }
            val lastIndex = listState.layoutInfo.totalItemsCount - 1
            if (lastIndex >= 0) {
                listState.animateScrollToItem(
                    index = lastIndex,
                    scrollOffset = 0
                )
            }
        }
    }

    val visibleTimeline = data.timeline.take(visibleTimelineCount)
    val visibleCascade = data.cascade.take(cascadeVisibleCount)
    val visibleMitigation = data.mitigation.take(mitigationVisibleCount)

    val currentDay = when (simulationPhase) {
        0 -> visibleCascade.lastOrNull()?.day ?: 0
        else -> visibleTimeline.lastOrNull()?.day ?: 0
    }

    val complete =
        !isSimulating &&
                simulationPhase == 3 &&
                cascadeVisibleCount >= data.cascade.size &&
                visibleTimelineCount >= data.timeline.size &&
                mitigationVisibleCount >= data.mitigation.size

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item(key = "what_if_hero") {
            WhatIfHero(station)
        }

        item(key = "scenario_selector") {
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Card)
                    .border(1.dp, Border, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(11.dp))
                            .background(Color(0xFF173E4D)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Outlined.Bolt, null, tint = Teal)
                    }

                    Spacer(Modifier.width(10.dp))

                    Column(Modifier.weight(1f)) {
                        Text(
                            "OPERATIONAL DISRUPTION",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = .9.sp,
                            color = TextTeal
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            "Select the event you want to introduce into the digital twin",
                            fontSize = 12.sp,
                            lineHeight = 13.sp,
                            color = Secondary
                        )
                    }

                    //SmallChip("3 CALIBRATED SCENARIOS", Secondary)
                }

                Spacer(Modifier.height(14.dp))

                ScenarioCard(
                    "01", "GENERATOR FAILURE", "ENERGY SYSTEM",
                    "Simulate primary generator loss and observe its effect on station power availability, fuel demand, and operational continuity.",
                    selectedScenario == Scenario.GENERATOR_FAILURE,
                    Red,
                    Icons.Outlined.PowerSettingsNew
                ) {
                    isSimulating = false
                    elapsedSimulationMs = 0L
                    visibleTimelineCount = 0
                    cascadeVisibleCount = 0
                    mitigationVisibleCount = 0
                    simulationPhase = 0
                    selectedScenario = Scenario.GENERATOR_FAILURE
                }

                ScenarioCard(
                    "02", "BLIZZARD", "ENVIRONMENTAL EVENT",
                    "Introduce severe Antarctic weather conditions and project impacts across logistics, energy consumption, field operations, and readiness.",
                    selectedScenario == Scenario.BLIZZARD,
                    Teal,
                    Icons.Outlined.AcUnit
                ) {
                    isSimulating = false
                    elapsedSimulationMs = 0L
                    visibleTimelineCount = 0
                    cascadeVisibleCount = 0
                    mitigationVisibleCount = 0
                    simulationPhase = 0
                    selectedScenario = Scenario.BLIZZARD
                }

                ScenarioCard(
                    "03", "RESUPPLY DELAY", "LOGISTICS EVENT",
                    "Delay incoming supplies and examine how reserves, medical inventory, food availability, and operational endurance are affected.",
                    selectedScenario == Scenario.RESUPPLY_DELAY,
                    Gold,
                    Icons.Outlined.Schedule
                ) {
                    isSimulating = false
                    elapsedSimulationMs = 0L
                    visibleTimelineCount = 0
                    cascadeVisibleCount = 0
                    mitigationVisibleCount = 0
                    simulationPhase = 0
                    selectedScenario = Scenario.RESUPPLY_DELAY
                }
            }
        }

        item(key = "active_scenario") {
            ActiveScenario(
                station = station,
                title = data.title,
                running = isSimulating,
                onRunSimulation = {
                    if (!isSimulating) {
                        elapsedSimulationMs = 0L
                        visibleTimelineCount = 0
                        cascadeVisibleCount = 0
                        mitigationVisibleCount = 0
                        simulationPhase = 0
                        isSimulating = true
                    }
                }
            )
        }

        if (isSimulating || visibleTimelineCount > 0 || cascadeVisibleCount > 0) {
            item(key = "simulation_output") {
                SimulationOutputHeader(
                    data = data,
                    currentDay = currentDay,
                    elapsedMs = elapsedSimulationMs,
                    totalDurationMs = totalSimulationMs.coerceAtLeast(1L),
                    isComplete = complete
                )
            }

            // PHASE 1: cascade appears first.
            if (visibleCascade.isNotEmpty()) {
                item(key = "simulation_cascade") {
                    SimulationCascadeCard(
                        steps = visibleCascade,
                        isSimulating = isSimulating && simulationPhase == 0
                    )
                }
            }

            // PHASE 2: only begins after ALL cascade stages are visible.
            if (simulationPhase >= 1 && visibleTimeline.isNotEmpty()) {
                item(key = "simulation_timeline") {
                    SimulationTimelineCard(
                        events = visibleTimeline
                    )
                }
            }

            // PHASE 3: only begins after ALL timeline cards are visible.
            if (simulationPhase >= 2 && visibleMitigation.isNotEmpty()) {
                item(key = "simulation_mitigation") {
                    SimulationMitigationCard(
                        actions = visibleMitigation,
                        isSimulating = isSimulating && simulationPhase == 2
                    )
                }
            }

            if (complete) {
                item(key = "simulation_complete") {
                    SimulationCompleteCard()
                }
            } else {
                item(key = "simulation_status") {
                    SimulationStatusLine(
                        currentDay = currentDay,
                        maxDay = data.maxDay,
                        isSimulating = isSimulating,
                        simulationPhase = simulationPhase,
                        cascadeVisibleCount = cascadeVisibleCount,
                        cascadeTotal = data.cascade.size,
                        timelineVisibleCount = visibleTimelineCount,
                        timelineTotal = data.timeline.size,
                        mitigationVisibleCount = mitigationVisibleCount,
                        mitigationTotal = data.mitigation.size
                    )
                }
            }
        }

        item(key = "what_if_bottom_space") {
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun SimulationOutputHeader(
    data: SimulationScenarioData,
    currentDay: Int,
    elapsedMs: Long,
    totalDurationMs: Long,
    isComplete: Boolean
) {
    val progress =
        if (isComplete) 1f
        else (elapsedMs.toFloat() / totalDurationMs.toFloat()).coerceIn(0f, 1f)

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Card)
            .border(1.dp, Color(0xFF315363), RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(11.dp))
                    .background(Color(0xFF1A3B4B)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.Shield, null, tint = TextTeal)
            }

            Spacer(Modifier.width(10.dp))

            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(6.dp)
                            .clip(RoundedCornerShape(50))
                            .background(if (isComplete) Green else Teal)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        if (isComplete) "SIMULATION COMPLETE" else "SIMULATION RUNNING",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = .9.sp,
                        color = if (isComplete) Green else Teal
                    )
                }

                Spacer(Modifier.height(3.dp))

                Text(
                    data.title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DarkText
                )

                Text(
                    if (isComplete) "Projected operational cascade successfully generated."
                    else "Projected operational cascade and mitigation response.",
                    fontSize = 11.sp,
                    lineHeight = 13.sp,
                    color = Secondary
                )
            }

            SmallChip(
                if (isComplete) "• POLAR PHYSICS MODEL V2.4" else "• SIMULATING",
                if (isComplete) Green else Teal
            )
        }

        Spacer(Modifier.height(15.dp))

        Text(
            "SIMULATION PROGRESS",
            fontSize = 12.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = .9.sp,
            color = Secondary
        )

        Spacer(Modifier.height(5.dp))

        Box(
            Modifier
                .fillMaxWidth()
                .height(5.dp)
                .clip(RoundedCornerShape(50))
                .background(Color(0xFF294958))
        ) {
            Box(
                Modifier
                    .fillMaxWidth(progress)
                    .height(5.dp)
                    .background(Brush.horizontalGradient(listOf(Teal, Gold)))
            )
        }

        Spacer(Modifier.height(5.dp))

        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                "DAY $currentDay",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Secondary
            )
            Text(
                "${(progress * 100).toInt()}%",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = TextTeal
            )
        }
    }
}

@Composable
private fun SimulationTimelineCard(
    events: List<SimulationTimelineEvent>
) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF102D3E))
            .border(1.dp, Color(0xFF403A57), RoundedCornerShape(20.dp))
    ) {
        SimulationSectionHeader(
            Icons.Outlined.CalendarMonth,
            "EVENT TIMELINE",
            "Projected sequence of operational events",
            Purple
        )

        Column(
            Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            events.forEachIndexed { index, event ->
                SimulationDayItem(
                    day = event.day,
                    text = event.text,
                    highlighted = index == events.lastIndex
                )
            }
        }
    }
}

@Composable
private fun SimulationDayItem(
    day: Int,
    text: String,
    highlighted: Boolean
) {
    Row(
        Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(DarkTeal),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "D$day",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
        }

        Spacer(Modifier.width(14.dp))

        Column(
            Modifier
                .weight(1f)
                .clip(RoundedCornerShape(14.dp))
                .background(if (highlighted) Color(0xFF122F40) else Color(0xFF112D3E))
                .border(
                    1.dp,
                    if (highlighted) Color(0xFF2F6875) else Color(0xFF294856),
                    RoundedCornerShape(14.dp)
                )
                .padding(horizontal = 14.dp, vertical = 13.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Outlined.Schedule,
                    contentDescription = null,
                    tint = Secondary,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    "DAY $day",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = .8.sp,
                    color = Secondary
                )
            }

            Spacer(Modifier.height(5.dp))

            Text(
                text,
                fontSize = 11.sp,
                lineHeight = 16.sp,
                fontWeight = if (highlighted) FontWeight.Medium else FontWeight.Normal,
                color = DarkText
            )
        }
    }
}

@Composable
private fun SimulationStatusLine(
    currentDay: Int,
    maxDay: Int,
    isSimulating: Boolean,
    simulationPhase: Int,
    cascadeVisibleCount: Int,
    cascadeTotal: Int,
    timelineVisibleCount: Int,
    timelineTotal: Int,
    mitigationVisibleCount: Int,
    mitigationTotal: Int
) {
    val message = when {
        !isSimulating && simulationPhase == 3 ->
            "Simulation sequence is being finalized..."

        simulationPhase == 0 ->
            "Simulating cascade — stage $cascadeVisibleCount of $cascadeTotal"

        simulationPhase == 1 ->
            "Projecting event timeline — event $timelineVisibleCount of $timelineTotal"

        simulationPhase == 2 ->
            "Generating mitigation response — action $mitigationVisibleCount of $mitigationTotal"

        else ->
            "Simulating day $currentDay of $maxDay — projecting station response..."
    }

    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center
    ) {
        Text(
            message,
            fontSize = 12.sp,
            lineHeight = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Secondary,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun WhatIfHero(
    station: Station
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFF143847), Color(0xFF3A3326))
                )
            )
            .border(1.dp, Color(0xFF315363), RoundedCornerShape(22.dp))
            .padding(18.dp)
    ) {

        Row {
            SmallChip("⚗ PREDICTIVE SIMULATION", Teal)
            Spacer(Modifier.width(6.dp))
            SmallChip("⌁ ${station.name.uppercase()} STATION", Gold)
        }

        Spacer(Modifier.height(15.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(13.dp))
                    .background(DarkTeal),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.AccountTree, null, tint = Color.White)
            }

            Spacer(Modifier.width(11.dp))

            Text(
                "What-If Command Center",
                fontSize = 28.sp,
                lineHeight = 31.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText
            )
        }

        Spacer(Modifier.height(8.dp))

        Text(
            "Explore operational disruptions virtually, trace their cascading effects, and evaluate mitigation pathways before field actions are taken.",
            fontSize = 12.sp,
            lineHeight = 15.sp,
            color = Secondary
        )

        Spacer(Modifier.height(15.dp))

        SimulationStep("01", "Select Trigger", "Choose an operational disruption to introduce into the station model.", Teal)
        SimulationStep("02", "Simulate Cascade", "Project how the disruption propagates through station infrastructure and resources.", Gold)
        SimulationStep("03", "Assess Response", "Review projected impacts, timelines, and recommended mitigation actions.", Purple)
    }
}

@Composable
private fun SimulationStep(
    number: String,
    title: String,
    description: String,
    tint: Color
) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(13.dp))
            .background(tint.copy(alpha = .07f))
            .border(1.dp, tint.copy(alpha = .28f), RoundedCornerShape(13.dp))
            .padding(11.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            Modifier
                .size(29.dp)
                .clip(RoundedCornerShape(9.dp))
                .background(tint.copy(alpha = .13f)),
            contentAlignment = Alignment.Center
        ) {
            Text(number, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = tint)
        }

        Spacer(Modifier.width(9.dp))

        Column {
            Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DarkText)
            Text(description, fontSize = 12.sp, lineHeight = 13.sp, color = Secondary)
        }
    }
}

@Composable
private fun ScenarioCard(
    number: String,
    title: String,
    category: String,
    description: String,
    selected: Boolean,
    tint: Color,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Column(
        Modifier
            .fillMaxWidth()
            .padding(bottom = 9.dp)
            .clip(RoundedCornerShape(17.dp))
            .background(if (selected) tint.copy(alpha = .14f) else Color(0xFF102D3E))
            .border(
                if (selected) 2.dp else 1.dp,
                if (selected) tint else tint.copy(alpha = .35f),
                RoundedCornerShape(17.dp)
            )
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(tint.copy(alpha = .12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = tint)
            }

            Spacer(Modifier.width(10.dp))

            Column(Modifier.weight(1f)) {
                Text(category, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = .8.sp, color = tint)
                Spacer(Modifier.height(3.dp))
                Text(title, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DarkText)
            }

            Text(number, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = tint)
        }

        Spacer(Modifier.height(10.dp))
        Text(description, fontSize = 12.sp, lineHeight = 15.sp, color = Secondary)
        Spacer(Modifier.height(10.dp))
        DividerLine()
        Spacer(Modifier.height(8.dp))

        Text(
            if (selected) "◉  SCENARIO SELECTED" else "◌  AVAILABLE TRIGGER",
            fontSize = 12.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = .7.sp,
            color = if (selected) tint else Secondary
        )
    }
}

@Composable
private fun ActiveScenario(
    station: Station,
    title: String,
    running: Boolean,
    onRunSimulation: () -> Unit
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(Color(0xFF173B49), Color(0xFF3A3325))
                )
            )
            .border(1.dp, Color(0xFF665531), RoundedCornerShape(18.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(DarkTeal),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Outlined.AutoGraph, null, tint = Color.White)
        }

        Spacer(Modifier.width(10.dp))

        Column(Modifier.weight(1f)) {
            Text("ACTIVE SCENARIO", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = .8.sp, color = Gold)
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DarkText)
            Text(
                if (running) "Simulation running on the ${station.name.lowercase()} operational model."
                else "The selected trigger will be injected into the ${station.name.lowercase()} operational model.",
                fontSize = 11.sp,
                lineHeight = 13.sp,
                color = Secondary
            )
        }

        Box(
            Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(if (running) Secondary else Gold)
                .clickable(enabled = !running, onClick = onRunSimulation)
                .padding(horizontal = 13.dp, vertical = 12.dp)
        ) {
            Text(
                if (running) "▶  Simulating..." else "▶  Run Simulation  →",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
        }
    }
}

@Composable
private fun SimulationCascadeCard(
    steps: List<SimulationCascadeStep>,
    isSimulating: Boolean
) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF112F40))
            .border(1.dp, Border, RoundedCornerShape(20.dp))
    ) {
        SimulationSectionHeader(
            Icons.Outlined.ErrorOutline,
            "IMPACT CASCADE",
            if (isSimulating) "Cascade stages are being generated" else "Cascade sequence generated",
            Gold
        )

        Column(
            Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            steps.forEachIndexed { index, step ->
                SimulationCascadeStepCard(step, index + 1)

                if (index != steps.lastIndex) {
                    Box(
                        Modifier
                            .padding(vertical = 9.dp)
                            .size(20.dp)
                            .clip(RoundedCornerShape(50))
                            .background(Color(0xFF1B3D4D))
                            .border(1.dp, Color(0xFF315B68), RoundedCornerShape(50)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Outlined.KeyboardArrowDown,
                            contentDescription = null,
                            tint = Secondary,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SimulationCascadeStepCard(
    step: SimulationCascadeStep,
    number: Int
) {
    Row(
        Modifier
            .fillMaxWidth(.88f)
            .clip(RoundedCornerShape(14.dp))
            .background(step.tint.copy(alpha = .06f))
            .border(1.dp, step.tint.copy(alpha = .28f), RoundedCornerShape(14.dp))
            .padding(13.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(step.tint.copy(alpha = .10f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "%02d".format(number),
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = step.tint
            )
        }

        Spacer(Modifier.width(10.dp))

        Column(Modifier.weight(1f)) {
            Text(
                step.label,
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = .8.sp,
                color = step.tint
            )
            Spacer(Modifier.height(4.dp))
            Text(
                step.text,
                fontSize = 12.sp,
                lineHeight = 15.sp,
                color = DarkText
            )
        }
    }
}

@Composable
private fun SimulationMitigationCard(
    actions: List<String>,
    isSimulating: Boolean
) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Card)
            .border(1.dp, Color(0xFF315A48), RoundedCornerShape(20.dp))
    ) {
        SimulationSectionHeader(
            Icons.Outlined.CheckBox,
            "RECOMMENDED MITIGATION",
            if (isSimulating) "Response actions are being generated" else "Response actions derived from the simulated scenario",
            Green
        )

        Column(
            Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            actions.forEachIndexed { index, action ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Green.copy(alpha = .10f))
                            .border(1.dp, Green.copy(alpha = .22f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "${index + 1}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Green
                        )
                    }

                    Spacer(Modifier.width(10.dp))

                    Column(
                        Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF122F3A))
                            .border(1.dp, Color(0xFF315748), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Outlined.VerifiedUser,
                                contentDescription = null,
                                tint = Green,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                "ACTION ${index + 1}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = .7.sp,
                                color = Green
                            )
                        }

                        Spacer(Modifier.height(4.dp))

                        Text(
                            action,
                            fontSize = 12.sp,
                            lineHeight = 15.sp,
                            color = DarkText
                        )
                    }
                }

                if (index != actions.lastIndex) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Outlined.KeyboardArrowDown,
                            contentDescription = null,
                            tint = Color(0xFF8FB3A0),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SimulationSectionHeader(
    icon: ImageVector,
    title: String,
    subtitle: String,
    tint: Color
) {
    Column {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                Modifier
                    .size(31.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(tint.copy(alpha = .10f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = tint, modifier = Modifier.size(16.dp))
            }

            Spacer(Modifier.width(9.dp))

            Column {
                Text(
                    title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = .9.sp,
                    color = TextTeal
                )
                Spacer(Modifier.height(2.dp))
                Text(subtitle, fontSize = 12.sp, lineHeight = 12.sp, color = Secondary)
            }
        }

        DividerLine()
    }
}

@Composable
private fun SimulationCompleteCard() {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFF15382F))
            .border(1.dp, Color(0xFF315A48), RoundedCornerShape(18.dp))
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(Green.copy(alpha = .12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Outlined.AutoAwesome,
                contentDescription = null,
                tint = Green,
                modifier = Modifier.size(23.dp)
            )
        }

        Spacer(Modifier.height(10.dp))

        Text(
            "SIMULATION COMPLETE",
            fontSize = 11.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 1.1.sp,
            color = TextTeal
        )

        Spacer(Modifier.height(3.dp))

        Text(
            "Full impact, timeline, and mitigation sequence has been projected.",
            fontSize = 11.sp,
            lineHeight = 13.sp,
            color = Secondary,
            textAlign = TextAlign.Center
        )

        Spacer(Modifier.height(13.dp))

        // Deliberately vertical, rather than the previous horizontal row.
        SimulationFlowStep("TRIGGER", Red, Icons.Outlined.Bolt)
        SimulationFlowArrow()
        SimulationFlowStep("CASCADE", Teal, Icons.Outlined.AutoGraph)
        SimulationFlowArrow()
        SimulationFlowStep("TIMELINE", Purple, Icons.Outlined.Schedule)
        SimulationFlowArrow()
        SimulationFlowStep("MITIGATION", Green, Icons.Outlined.VerifiedUser)
    }
}

@Composable
private fun SimulationFlowStep(
    label: String,
    tint: Color,
    icon: ImageVector
) {
    Row(
        Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(tint.copy(alpha = .10f))
            .border(1.dp, tint.copy(alpha = .22f), RoundedCornerShape(10.dp))
            .padding(horizontal = 13.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = tint, modifier = Modifier.size(14.dp))
        Spacer(Modifier.width(7.dp))
        Text(
            label,
            fontSize = 12.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = .6.sp,
            color = tint
        )
    }
}

@Composable
private fun SimulationFlowArrow() {
    Icon(
        Icons.Outlined.KeyboardArrowDown,
        contentDescription = null,
        tint = Secondary,
        modifier = Modifier
            .padding(vertical = 3.dp)
            .size(17.dp)
    )
}


// ============================================================
// FORECAST
// ============================================================


@Composable
private fun ForecastScreen(
    station: Station
) {

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

        item {
            ForecastHero(station)
        }

        item {

            ForecastResourceCard(
                title = "Diesel Reserve",
                current = station.forecastDiesel,
                maxY = 60f,
                tint = Teal,
                warningDay = 28,
                criticalDay = null,
                unit = "days"
            )
        }

        item {

            ForecastResourceCard(
                title = "Food Supplies",
                current = station.forecastFood,
                maxY = 80f,
                tint = Green,
                warningDay = null,
                criticalDay = null,
                unit = "days"
            )
        }

        item {
            Spacer(Modifier.height(20.dp))
        }
    }
}


@Composable
private fun ForecastHero(
    station: Station
) {

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFF143847),
                        Color(0xFF3A3326)
                    )
                )
            )
            .border(
                1.dp,
                Color(0xFF315363),
                RoundedCornerShape(22.dp)
            )
            .padding(18.dp)
    ) {

        Row {

            SmallChip(
                "⌁ DEPLETION HORIZON ANALYSIS",
                Teal
            )

            Spacer(Modifier.width(6.dp))

            SmallChip(
                "⌁ ${station.name.uppercase()} STATION",
                Gold
            )
        }

        Spacer(Modifier.height(14.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(13.dp))
                    .background(DarkTeal),
                contentAlignment = Alignment.Center
            ) {

                Icon(
                    Icons.Outlined.CalendarMonth,
                    null,
                    tint = Color.White
                )
            }

            Spacer(Modifier.width(11.dp))

            Text(
                "Resource Autonomy & Depletion",
                fontSize = 27.sp,
                lineHeight = 30.sp,
                fontWeight = FontWeight.Bold,
                color = DarkText
            )
        }

        Spacer(Modifier.height(7.dp))

        Text(
            "Continuous daily linear projection for mission-critical fuel and food supplies. Evaluates days remaining against standard 15-day warning and 7-day emergency critical thresholds.",
            fontSize = 12.sp,
            lineHeight = 14.sp,
            color = Secondary
        )

        Spacer(Modifier.height(13.dp))

        DividerLine()

        Spacer(Modifier.height(11.dp))

        Column(
            verticalArrangement = Arrangement.spacedBy(7.dp)
        ) {

            Text(
                "◷  Forecast Window: Day 0 to Day 30",
                fontSize = 12.sp,
                color = DarkText
            )

            Text(
                "♢  Thresholds: Warning 15d • Critical 7d",
                fontSize = 12.sp,
                color = DarkText
            )
        }
    }
}


@Composable
private fun ForecastResourceCard(
    title: String,
    current: Float,
    maxY: Float,
    tint: Color,
    warningDay: Int?,
    criticalDay: Int?,
    unit: String
) {
    var selectedDay by remember(title, current) { mutableStateOf<Int?>(null) }

    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Card)
            .border(1.dp, Border, RoundedCornerShape(20.dp))
            .padding(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(tint.copy(alpha = .11f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (title.contains("Diesel")) Icons.Outlined.LocalGasStation
                    else Icons.Outlined.Restaurant,
                    null,
                    tint = tint,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(Modifier.width(10.dp))

            Column(Modifier.weight(1f)) {
                Text(
                    "RESOURCE DEPLETION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp,
                    color = tint
                )
                Text(
                    title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DarkText
                )
            }

            SmallChip("● Nominal", Green)
        }

        Spacer(Modifier.height(14.dp))

        Column(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF142F3F))
                .border(1.dp, Border, RoundedCornerShape(14.dp))
                .padding(14.dp)
        ) {
            Text(
                "CURRENT AUTONOMOUS RESERVE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = .5.sp,
                color = Teal
            )

            Spacer(Modifier.height(3.dp))

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    "%.1f".format(current),
                    fontSize = 34.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DarkText
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    "$unit remaining",
                    fontSize = 13.sp,
                    color = Secondary,
                    modifier = Modifier.padding(bottom = 5.dp)
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        ForecastChart(
            current = current,
            maxY = maxY,
            tint = tint,
            unit = unit,
            selectedDay = selectedDay,
            onDaySelected = { selectedDay = it }
        )

        Spacer(Modifier.height(12.dp))
        DividerLine()
        Spacer(Modifier.height(12.dp))

        Text(
            "DEPLETION THRESHOLDS",
            fontSize = 11.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 1.sp,
            color = Teal
        )

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            ThresholdBox(
                title = "Warning Threshold (15d)",
                description = if (warningDay != null)
                    "Crosses warning threshold on day $warningDay"
                else
                    "Does not cross warning threshold within 30 days",
                tint = Gold,
                modifier = Modifier.weight(1f)
            )
            ThresholdBox(
                title = "Critical Threshold (7d)",
                description = if (criticalDay != null)
                    "Crosses critical threshold on day $criticalDay"
                else
                    "Does not cross critical threshold within 30 days",
                tint = Green,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun ForecastChart(
    current: Float,
    maxY: Float,
    tint: Color,
    unit: String,
    selectedDay: Int?,
    onDaySelected: (Int?) -> Unit
) {
    val yTicks = when {
        maxY <= 60f -> listOf(0f, 15f, 30f, 45f, 60f)
        else -> listOf(0f, 20f, 40f, 60f, 80f)
    }

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .height(250.dp)
    ) {
        val chartLeft = 48.dp
        val chartRightPadding = 10.dp
        val chartTop = 14.dp
        val chartBottomPadding = 34.dp
        val plotAreaHeight = 210.dp
        val chartWidth = (maxWidth - chartLeft - chartRightPadding).coerceAtLeast(1.dp)
        val chartHeight = (plotAreaHeight - chartTop - chartBottomPadding).coerceAtLeast(1.dp)

        val popupWidth = 138.dp
        val popupHeight = 64.dp
        val popupGap = 14.dp

        val selectedX = selectedDay?.let { day ->
            chartLeft + chartWidth * (day / 30f)
        }

        val selectedValue = selectedDay?.let { day ->
            current * (1f - (day / 30f) * .72f)
        }

        val selectedY = selectedValue?.let { value ->
            chartTop + chartHeight * (1f - (value / maxY).coerceIn(0f, 1f))
        }

        // Keep the popup offset from the selected point. Put it to the right
        // for early days and to the left for later days, while clamping it
        // inside the chart card so it never floats too far away.
        val popupX = selectedX?.let { pointX ->
            val preferred = if ((selectedDay ?: 0) <= 16) {
                pointX + popupGap
            } else {
                pointX - popupWidth - popupGap
            }
            preferred.coerceIn(4.dp, maxWidth - popupWidth - 4.dp)
        }

        val popupY = selectedY?.let { pointY ->
            val preferred = pointY - popupHeight - popupGap
            preferred.coerceIn(4.dp, maxHeight - popupHeight - 4.dp)
        }

        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = chartLeft, end = chartRightPadding),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        Icons.Outlined.ShowChart,
                        contentDescription = null,
                        tint = tint,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(Modifier.width(7.dp))
                    Text(
                        "30-Day Autonomy Projection",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = TextTeal,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Text(
                    "Target: Linear Depletion",
                    fontSize = 11.sp,
                    lineHeight = 12.sp,
                    color = Secondary,
                    textAlign = TextAlign.End,
                    modifier = Modifier.widthIn(max = 118.dp)
                )
            }

            Spacer(Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(plotAreaHeight)
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(current, maxY, selectedDay) {
                            detectTapGestures { offset ->
                                val leftPx = chartLeft.toPx()
                                val rightPx = size.width - chartRightPadding.toPx()

                                // Only taps inside the actual plotting area
                                // select a point. Tapping the same selected
                                // point toggles the popup closed.
                                if (
                                    offset.x >= leftPx &&
                                    offset.x <= rightPx &&
                                    offset.y >= chartTop.toPx() &&
                                    offset.y <= size.height - chartBottomPadding.toPx()
                                ) {
                                    val plotWidth = rightPx - leftPx
                                    val day = (
                                            ((offset.x - leftPx) / plotWidth) * 30f
                                            ).roundToInt().coerceIn(0, 30)

                                    if (selectedDay == day) {
                                        onDaySelected(null)
                                    } else {
                                        onDaySelected(day)
                                    }
                                } else if (selectedDay != null) {
                                    onDaySelected(null)
                                }
                            }
                        }
                ) {
                    val chartRight = size.width - chartRightPadding.toPx()
                    val chartTopPx = chartTop.toPx()
                    val chartBottom = size.height - chartBottomPadding.toPx()
                    val usableHeight = chartBottom - chartTopPx
                    val leftPx = chartLeft.toPx()

                    fun yFor(value: Float): Float =
                        chartBottom -
                                (value / maxY).coerceIn(0f, 1f) * usableHeight

                    fun xFor(day: Int): Float =
                        leftPx + (day / 30f) * (chartRight - leftPx)

                    // Grid.
                    yTicks.forEach { value ->
                        val y = yFor(value)
                        drawLine(
                            color = Border.copy(alpha = .8f),
                            start = Offset(leftPx, y),
                            end = Offset(chartRight, y),
                            strokeWidth = 1f,
                            pathEffect = androidx.compose.ui.graphics.PathEffect
                                .dashPathEffect(floatArrayOf(4f, 5f))
                        )
                    }

                    // Axes.
                    drawLine(
                        color = Border,
                        start = Offset(leftPx, chartTopPx),
                        end = Offset(leftPx, chartBottom),
                        strokeWidth = 1f
                    )
                    drawLine(
                        color = Border,
                        start = Offset(leftPx, chartBottom),
                        end = Offset(chartRight, chartBottom),
                        strokeWidth = 1f
                    )

                    // Thresholds.
                    drawLine(
                        color = Gold,
                        start = Offset(leftPx, yFor(15f)),
                        end = Offset(chartRight, yFor(15f)),
                        strokeWidth = 1.8f,
                        pathEffect = androidx.compose.ui.graphics.PathEffect
                            .dashPathEffect(floatArrayOf(7f, 5f))
                    )
                    drawLine(
                        color = Red,
                        start = Offset(leftPx, yFor(7f)),
                        end = Offset(chartRight, yFor(7f)),
                        strokeWidth = 1.8f,
                        pathEffect = androidx.compose.ui.graphics.PathEffect
                            .dashPathEffect(floatArrayOf(7f, 5f))
                    )

                    // Projection.
                    val path = Path()
                    for (day in 0..30) {
                        val fraction = day / 30f
                        val value = current * (1f - fraction * .72f)
                        val x = xFor(day)
                        val y = yFor(value)
                        if (day == 0) path.moveTo(x, y) else path.lineTo(x, y)
                    }

                    drawPath(
                        path = path,
                        color = tint,
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 3f)
                    )

                    drawCircle(
                        color = tint,
                        radius = 4f,
                        center = Offset(xFor(30), yFor(current * .28f))
                    )

                    // Selected point.
                    selectedDay?.let { day ->
                        val value = current * (1f - (day / 30f) * .72f)
                        val x = xFor(day)
                        val y = yFor(value)

                        drawLine(
                            color = Color(0xFF718C96),
                            start = Offset(x, chartTopPx),
                            end = Offset(x, chartBottom),
                            strokeWidth = 1f
                        )

                        drawCircle(
                            color = Color.White,
                            radius = 7f,
                            center = Offset(x, y)
                        )
                        drawCircle(
                            color = tint,
                            radius = 4f,
                            center = Offset(x, y)
                        )
                    }
                }

                // Y-axis labels are positioned against the exact same chart
                // bounds as the Canvas, keeping them aligned with grid lines.
                Column(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(top = 0.dp)
                        .width(chartLeft - 5.dp)
                        .height(chartHeight),
                    verticalArrangement = Arrangement.SpaceBetween,
                    horizontalAlignment = Alignment.End
                ) {
                    yTicks.reversed().forEach { value ->
                        Text(
                            "${value.toInt()}d",
                            fontSize = 11.sp,
                            color = Secondary,
                            maxLines = 1
                        )
                    }
                }

                // Keep threshold labels anchored to the exact Y position of
                // their dashed lines. The previous fixed offsets only happened
                // to work for one graph scale, so they drifted when maxY changed.
                // Use the exact same plot coordinate system as the Canvas.
                // The 14.dp label height is centered on the dashed-line Y
                // coordinate, so the text cannot drift from the line.
                val warningLineY =
                    chartTop + chartHeight * (1f - (15f / maxY).coerceIn(0f, 1f))
                val criticalLineY =
                    chartTop + chartHeight * (1f - (7f / maxY).coerceIn(0f, 1f))

                val thresholdLabelHeight = 14.dp
                val warningLabelY = warningLineY - thresholdLabelHeight / 2
                val criticalLabelY = criticalLineY - thresholdLabelHeight / 2

                Text(
                    "Warning (15d)",
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(y = warningLabelY + 5.dp)
                        .padding(end = chartRightPadding),
                    fontSize = 12.sp,
                    lineHeight = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Gold
                )

                Text(
                    "Critical (7d)",
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(y = criticalLabelY + 5.dp)
                        .padding(end = chartRightPadding),
                    fontSize = 12.sp,
                    lineHeight = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Red
                )

                // X-axis labels use the same left/right bounds as the plot.
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .padding(start = chartLeft, end = chartRightPadding),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf(0, 5, 10, 15, 20, 25, 30).forEach { day ->
                        Text(
                            "D$day",
                            fontSize = 11.sp,
                            color = Secondary
                        )
                    }
                }

                // Popup is deliberately offset from the selected point rather
                // than placed directly over the tap location. It is clamped
                // to the chart bounds and changes side depending on the day.
                if (selectedDay != null && popupX != null && popupY != null) {
                    Box(
                        modifier = Modifier
                            .offset(x = popupX, y = popupY)
                            .width(popupWidth)
                            .height(popupHeight)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF163748))
                            .border(
                                1.dp,
                                Color(0xFF355766),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 9.dp)
                    ) {
                        Column {
                            Text(
                                "Day $selectedDay",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DarkText
                            )
                            Spacer(Modifier.height(2.dp))
                            Text(
                                "%.1f %s remaining".format(selectedValue ?: 0f, unit),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Teal,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ThresholdBox(
    title: String,
    description: String,
    tint: Color,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(tint.copy(alpha = .07f))
            .border(
                1.dp,
                tint.copy(alpha = .25f),
                RoundedCornerShape(10.dp)
            )
            .padding(10.dp)
    ) {

        Text(
            "◉  $title",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = tint
        )

        Spacer(Modifier.height(4.dp))

        Text(
            description,
            fontSize = 12.sp,
            lineHeight = 11.sp,
            color = Secondary
        )
    }
}


// ============================================================
// SMALL COMPONENTS
// ============================================================

@Composable
private fun SmallChip(
    text: String,
    color: Color
) {

    Text(
        text,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = color,
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = .08f))
            .border(
                1.dp,
                color.copy(alpha = .16f),
                RoundedCornerShape(20.dp)
            )
            .padding(
                horizontal = 8.dp,
                vertical = 5.dp
            )
    )
}


@Composable
private fun DividerLine() {

    Box(
        Modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(Color(0xFF294A58))
    )
}
