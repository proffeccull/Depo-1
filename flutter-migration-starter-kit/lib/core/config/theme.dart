import 'package:flutter/material.dart';

class ChainGiveTheme {
  // Color palette
  static const Color primaryColor = Color(0xFF1E3A8A); // Blue
  static const Color secondaryColor = Color(0xFF10B981); // Green
  static const Color accentColor = Color(0xFFF59E0B); // Amber
  static const Color errorColor = Color(0xFFEF4444); // Red
  static const Color warningColor = Color(0xFFF59E0B); // Amber
  static const Color successColor = Color(0xFF10B981); // Green

  // Background colors
  static const Color backgroundColor = Color(0xFFFFFFFF);
  static const Color surfaceColor = Color(0xFFF8FAFC);
  static const Color cardColor = Color(0xFFFFFFFF);

  // Text colors
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textHint = Color(0xFF94A3B8);
  // Cultural colors inspired by African art
  static const Color savannaGold = Color(0xFFD4AF37);
  static const Color baobabBrown = Color(0xFF8B4513);
  static const Color acaciaGreen = Color(0xFF228B22);
  static const Color sunsetOrange = Color(0xFFFF8C00);
  static const Color indigoBlue = Color(0xFF4B0082);
  static const Color kenteRed = Color(0xFFDC143C);
  static const Color adireBlue = Color(0xFF00BFFF);
  static const Color geleYellow = Color(0xFFFFD700);
  static const Color clayBeige = Color(0xFFF5F5DC);
  static const Color charcoal = Color(0xFF36454F);

  // Light theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // Color scheme
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        error: errorColor,
        surface: surfaceColor,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimary,
        onError: Colors.white,
      ),

      // App bar theme
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),

      // Card theme
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        surfaceTintColor: Colors.transparent,
      ),

      // Button themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: textHint),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: textHint),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: errorColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: const TextStyle(color: textHint),
        labelStyle: const TextStyle(color: textSecondary),
      ),

      // Text theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineLarge: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        titleMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        titleSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: textPrimary,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: textPrimary,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: textSecondary,
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textSecondary,
        ),
        labelSmall: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: textHint,
        ),
      ),

      // Icon theme
      iconTheme: const IconThemeData(
        color: textSecondary,
        size: 24,
      ),

      // Floating action button theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),

      // Bottom navigation bar theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // Tab bar theme
      tabBarTheme: const TabBarThemeData(
        labelColor: primaryColor,
        unselectedLabelColor: textSecondary,
        indicatorColor: primaryColor,
        indicatorSize: TabBarIndicatorSize.tab,
      ),

      // Dialog theme
      dialogTheme: DialogThemeData(
        backgroundColor: cardColor,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        surfaceTintColor: Colors.transparent,
      ),

      // SnackBar theme
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: surfaceColor,
        contentTextStyle: TextStyle(color: textPrimary),
        actionTextColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
        ),
      ),

      // Progress indicator theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primaryColor,
        linearTrackColor: surfaceColor,
      ),

      // Checkbox theme
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith<Color>((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryColor;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),

      // Radio theme
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith<Color>((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryColor;
          }
          return textSecondary;
        }),
      ),

      // Switch theme
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith<Color>((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryColor;
          }
          return Colors.white;
        }),
        trackColor: WidgetStateProperty.resolveWith<Color>((states) {
          if (states.contains(WidgetState.selected)) {
            return Color.fromRGBO(primaryColor.red, primaryColor.green, primaryColor.blue, 0.5);
          }
          return Color.fromRGBO(textSecondary.red, textSecondary.green, textSecondary.blue, 0.3);
        }),
      ),

      // Divider theme
      dividerTheme: const DividerThemeData(
        color: textHint,
        thickness: 1,
        space: 1,
      ),

      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: surfaceColor,
        disabledColor: Color.fromRGBO(textHint.red, textHint.green, textHint.blue, 0.1),
        selectedColor: Color.fromRGBO(primaryColor.red, primaryColor.green, primaryColor.blue, 0.1),
        secondarySelectedColor: Color.fromRGBO(secondaryColor.red, secondaryColor.green, secondaryColor.blue, 0.1),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        labelStyle: const TextStyle(
          color: textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        secondaryLabelStyle: const TextStyle(
          color: primaryColor,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        brightness: Brightness.light,
      ),

      // Expansion tile theme
      expansionTileTheme: const ExpansionTileThemeData(
        backgroundColor: surfaceColor,
        collapsedBackgroundColor: surfaceColor,
        textColor: textPrimary,
        collapsedTextColor: textPrimary,
        iconColor: textSecondary,
        collapsedIconColor: textSecondary,
      ),

      // List tile theme
      listTileTheme: const ListTileThemeData(
        tileColor: Colors.transparent,
        selectedTileColor: primaryColor,
        textColor: textPrimary,
        iconColor: textSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
      ),

      // Tooltip theme
      tooltipTheme: const TooltipThemeData(
        decoration: BoxDecoration(
          color: textPrimary,
          borderRadius: BorderRadius.all(Radius.circular(4)),
        ),
        textStyle: TextStyle(
          color: Colors.white,
          fontSize: 12,
        ),
      ),

      // Bottom sheet theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: cardColor,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
      ),

      // Navigation rail theme
      navigationRailTheme: const NavigationRailThemeData(
        backgroundColor: surfaceColor,
        selectedIconTheme: IconThemeData(color: primaryColor),
        unselectedIconTheme: IconThemeData(color: textSecondary),
        selectedLabelTextStyle: TextStyle(color: primaryColor),
        unselectedLabelTextStyle: TextStyle(color: textSecondary),
      ),

      // Navigation drawer theme
      navigationDrawerTheme: const NavigationDrawerThemeData(
        backgroundColor: cardColor,
      ),

      // Segmented button theme
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith<Color>((states) {
            if (states.contains(WidgetState.selected)) {
              return primaryColor;
            }
            return Colors.transparent;
          }),
          foregroundColor: WidgetStateProperty.resolveWith<Color>((states) {
            if (states.contains(WidgetState.selected)) {
              return Colors.white;
            }
            return textPrimary;
          }),
          side: WidgetStateProperty.resolveWith<BorderSide>((states) {
            return const BorderSide(color: textHint);
          }),
        ),
      ),

      // Slider theme
      sliderTheme: const SliderThemeData(
        activeTrackColor: primaryColor,
        inactiveTrackColor: textHint,
        thumbColor: primaryColor,
        overlayColor: primaryColor,
        valueIndicatorColor: primaryColor,
      ),

      // Popup menu theme
      popupMenuTheme: const PopupMenuThemeData(
        color: cardColor,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
      ),

      // Menu theme
      menuTheme: const MenuThemeData(
        style: MenuStyle(
          backgroundColor: WidgetStatePropertyAll(cardColor),
          elevation: WidgetStatePropertyAll(8),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8)),
            ),
          ),
        ),
      ),

      // Search bar theme
      searchBarTheme: SearchBarThemeData(
        backgroundColor: WidgetStateProperty.all(surfaceColor),
        elevation: WidgetStateProperty.all(2),
        shape: WidgetStateProperty.all(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        textStyle: WidgetStateProperty.all(
          const TextStyle(color: textPrimary),
        ),
      ),

      // Search view theme
      searchViewTheme: const SearchViewThemeData(
        backgroundColor: surfaceColor,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
      ),

      // Date picker theme
      datePickerTheme: const DatePickerThemeData(
        backgroundColor: cardColor,
        headerBackgroundColor: primaryColor,
        headerForegroundColor: Colors.white,
        dayForegroundColor: WidgetStatePropertyAll(textPrimary),
        todayForegroundColor: WidgetStatePropertyAll(primaryColor),
        yearForegroundColor: WidgetStatePropertyAll(textPrimary),
      ),

      // Time picker theme
      timePickerTheme: const TimePickerThemeData(
        backgroundColor: cardColor,
        hourMinuteColor: surfaceColor,
        hourMinuteTextColor: textPrimary,
        dialHandColor: primaryColor,
        dialBackgroundColor: surfaceColor,
        entryModeIconColor: textSecondary,
      ),

      // Banner theme
      bannerTheme: const MaterialBannerThemeData(
        backgroundColor: warningColor,
        contentTextStyle: TextStyle(color: Colors.white),
      ),

      // Badge theme
      badgeTheme: const BadgeThemeData(
        backgroundColor: errorColor,
        textColor: Colors.white,
      ),

      // Data table theme
      dataTableTheme: DataTableThemeData(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(8),
        ),
        dataRowColor: WidgetStateProperty.all(Colors.transparent),
        headingRowColor: WidgetStateProperty.all(surfaceColor),
        headingTextStyle: const TextStyle(
          color: textPrimary,
          fontWeight: FontWeight.w600,
        ),
        dataTextStyle: const TextStyle(color: textPrimary),
        dividerThickness: 1,
      ),

      // Scrollbar theme
      scrollbarTheme: const ScrollbarThemeData(
        thickness: WidgetStatePropertyAll(6),
        radius: Radius.circular(3),
        thumbColor: WidgetStatePropertyAll(textHint),
      ),

      // Dropdown menu theme
      dropdownMenuTheme: DropdownMenuThemeData(
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surfaceColor,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: textHint),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: textHint),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: primaryColor, width: 2),
          ),
        ),
      ),

      // Menu bar theme
      menuBarTheme: const MenuBarThemeData(
        style: MenuStyle(
          backgroundColor: WidgetStatePropertyAll(cardColor),
          elevation: WidgetStatePropertyAll(8),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8)),
            ),
          ),
        ),
      ),

      // Drawer theme
      drawerTheme: const DrawerThemeData(
        backgroundColor: cardColor,
        elevation: 8,
      ),

      // Scaffold messenger theme (for SnackBars)
      scaffoldBackgroundColor: backgroundColor,

      // Visual density
      visualDensity: VisualDensity.adaptivePlatformDensity,

      // Material tap target size
      materialTapTargetSize: MaterialTapTargetSize.padded,

      // Page transitions theme
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: ZoomPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.linux: ZoomPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: ZoomPageTransitionsBuilder(),
        },
      ),

      // Splash factory
      splashFactory: InkRipple.splashFactory,

      // Highlight color
      highlightColor: Color.fromRGBO(primaryColor.red, primaryColor.green, primaryColor.blue, 0.1),

      // Focus color
      focusColor: Color.fromRGBO(primaryColor.red, primaryColor.green, primaryColor.blue, 0.1),

      // Hover color
      hoverColor: Color.fromRGBO(primaryColor.red, primaryColor.green, primaryColor.blue, 0.05),

      // Canvas color
      canvasColor: backgroundColor,

      // Card color
      cardColor: cardColor,

      // Shadow color
      shadowColor: Color.fromRGBO(0, 0, 0, 0.1),

      // Font family
      fontFamily: 'Roboto',

      // Typography
      typography: Typography.material2021(),
    );
  }

  // Dark theme (simplified version - can be expanded)
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        error: errorColor,
        surface: Color(0xFF1E293B),
        background: Color(0xFF0F172A),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E293B),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1E293B),
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}